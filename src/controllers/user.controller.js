import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt  from "jsonwebtoken";
import mongoose from "mongoose";
import { Video } from "../models/video.models.js";


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    let coverImageLocalPath = req.files?.coverImage?.[0]?.path;


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({ $or: [{ username }, { email }] });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
        sameSite:'none'
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: undefined } }, { new: true });

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
});

//this is creating for connecting the access token with refersh token when token is expired or thrown the 401 reqest
const refreshAccessToken =asyncHandler(async(req,res)=>{
   const incomingRefreshToken= req.cookies.refreshToken||req.body.refreshToken

   if(!incomingRefreshToken){
    throw new ApiError(401,"unauthorised request")
   }
     
  try {
     const decodedToken=jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
     )
  
     const user=await User.findById(decodedToken?._id)
  
     if(!user){
      throw new ApiError(401,"Invalid refresh token")
     }
    
  
     if(incomingRefreshToken!==user?.refreshToken){
      throw new ApiError(401,"refresh token is expired or used")
     }
  
  
      const options={
          httpOnly:true,
          secure:true
      }
  
      const{accessToken,newrefreshToken}=await generateAccessAndRefreshTokens(user._id)
  
  
      return res
      .status(200)
      .cookie("accessToken",accessToken,options)
      .cookie("refreshToken",newrefreshToken,options)
      .json(
          new ApiResponse(
              200,{accessToken,newrefreshToken},
              "Access token refershed"
          )
      )
  } catch (error) {

    throw new ApiError(401,error?.message||"Invalid refersh token")
    
  }
  

});

const changeCurrentPassword =asyncHandler(async(req,res)=>{
    const{oldPassword,newPassword}=req.body

    const user = await User.findById(req.user?._id)
    //isPasswordCorrect function ka use kr rahia h which is used in user model file
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)

//check kr rahi h ki old password is correct or not
    if(!isPasswordCorrect){
        throw new ApiError(400,"invalid old password")

    }

    //setting new password bec old password ios correct


    user.password =newPassword
    await user.save({validateBeforeSave:false})
    
    return res
    .status(200)
    .json(new ApiResponse(200,{},"password change successfully"))
})

const getCurrentUser = asyncHandler(async(req,res)=>{

   return res
   .status(200)
   .json(new ApiResponse (200,req.user,"current user fetches successfully"))
})


//text based data ko update karna
const updateAccountDeatails =asyncHandler(async(req,res)=>{
    const {fullName,email}=req.body

    if(!fullName||!email){
        throw new ApiError(400,"all fileds are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,
                email
            }

        },
        {new:true}




    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account details updated successfully"))

});



const updateUserAvatar =asyncHandler(async(req,res)=>
{
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"avatar files is missing")

    }

    const avatar =await uploadOnCloudinary
    (avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,"Error while uploading on avatar")

    }

    const user =await User.findByIdAndUpdate(
        res.user?._id,
    {
        $set:{
            avatar: avatar.url
            
        }

    },
    {new:true}
     ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"avatar update successfully"))   
})

const updateUserCoverImage =asyncHandler(async(req,res)=>
    {
        const coverImageLocalPath = req.file?.path
    
        if(!coverImageLocalPath){
            throw new ApiError(400,"cover image  files is missing")
    
        }
    
        const coverImage =await uploadOnCloudinary
        (coverImageLocalPath)
    
        if(!coverImage.url){
            throw new ApiError(400,"Error while uploading on coverImage")
    
        }
    
        const user =await User.findByIdAndUpdate(
            res.user?._id,
        {
            $set:{
                coverImage: coverImage.url
                
            }
    
        },
        {new:true}
         ).select("-password")
    
        return res
        .status(200)
        .json(new ApiResponse(200,user,"coverImage update successfully"))   
})

const getUserChannelProfile = asyncHandler(async(req,res)=>{

    const{username}=req.params

    if(!username?.trim()){
        throw new ApiError(400,"username is missing")

    }
    const channel= await User.aggregate([
    {
        $match:{
            username:username?.toLowerCase()
        }

    },
    {
        //chai aur code ke kitne subscribers h
        $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"channel",
            as:"subscribers"
        }
    },
    {
         //hameine kitne subscribe kre h
         $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"subscriber",
            as:"subscribedTo"
        }
    },
    {
        $addFields:{
            subscribersCount:{
                $size:"$subscribers"
            },
            channelsSubscribedToCount:{

                $size:"$subscribedTo"

            },
            isSubscribed:{
                $cond:{
                    if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                    then:true,
                    else:false
                }
            }
        }
    },{

        $project:{
            fullName:1,
            username:1,
            subscribersCount:1,
            channelsSubscribedToCount:1,
            isSubscribed:1,
            avatar:1,
            coverImage:1,
            email:1

        }
    }
])

if(!channel?.length){
    throw new ApiError(404,":channel  does not existed")
}
console.log(channel);

return res
.status(200)
.json(
    new ApiResponse(200,channel[0],"user channel feteched successfully")
)
})

const getWatchHistory =asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
                
            }
        },{
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[{
                                $project:{
                                    fullName:1,
                                    username:1,
                                    avatar:1
                                }
                            }]

                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "watch history feteched successfully"
        
        )
    )
})


const videoUpload = asyncHandler(async (req, res) => {
    try {
      // Log the req.file object for debugging
    //   console.log('Uploaded file:', req.file);
  
      // Ensure the file path is correctly extracted
      const file = req.file?.path;
    //   console.log('File path:', file);
  
      if (!file) {
        throw new ApiError(400, 'No video file uploaded');
      }
  
      // Upload the video to Cloudinary
      const video= await uploadOnCloudinary(file);
      console.log('Cloudinary upload response:', video);
  
      if (!video) {
        throw new ApiError(401, 'Video upload failed');
      }
  
      // Extract details from the request body
      const { title, description, isPublished = true, owner} = req.body;
      const views = 0; // Initialize views to 0 for a new video
  
      // Create the video details
      const videoDetails = await Video.create({
        videoFile:video.response.secure_url,
        thumbnail:video.thumbnailUrl,
        title,
        description,
        duration:video.response.duration,
        views,
        isPublished,
        owner,
      });
  
      return res.status(200).json(
        new ApiResponse(200, videoDetails, 'Video uploaded successfully')
      );
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json(
        new ApiError(500, error?.message || 'Video not uploaded')
      );
    }
  });

  const getAllUserVideos = asyncHandler(async (req, res) => {
    try {
      // Log the entire request object to debug
      console.log('Request Params:', req.params);
      console.log('Request URL:', req.url);
  
      const { owner } = req.params;
  
      if (!owner) {
        return res.status(400).json(new ApiError(400, 'Owner parameter is missing'));
      }
  
      // Use find to get all videos by owner
      const allVideos = await Video.find({ owner: owner })
        // Uncomment if you need to populate related fields, e.g., `owner`
        // .populate('owner', 'name') 
        .exec();
  
      return res.status(200).json(new ApiResponse(200, allVideos, 'Get all videos successfully'));
    } catch (error) {
      console.error(`Error fetching videos: ${error.message}`);
      return res.status(500).json(new ApiError(500, error?.message || 'Internal server error'));
    }
  });



  const getAllVideo =asyncHandler(async(req,res)=>{

    try {

        const allVideos =await Video.find()

        return res.status(200).json(new ApiResponse(200,allVideos,'get all videos successfully'));
        
    } catch (error) {

        return res.status(500).json(new ApiError(500,error?.message||'Internal server error'))
        
    }

  })
  


    



export {
    loginUser,
    logoutUser,
    registerUser,
    refreshAccessToken,
    getCurrentUser,
    changeCurrentPassword,
    updateAccountDeatails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
    videoUpload,
    getAllUserVideos,
    getAllVideo
};
