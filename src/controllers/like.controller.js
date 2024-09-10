// import { Like } from "../models/like.modles.js";
// import { Post } from "../models/post.modles.js";
// import { Tweet } from "../models/tweets.model.js";
// import { ApiError } from "../utils/ApiError.js";
// import { ApiResponse } from "../utils/ApiResponse.js";
// import { asyncHandler } from "../utils/asyncHandler.js";

// const likesonpost =asyncHandler(async(req,res)=>{

// try {


//     const{tweet,user}=req.body;


//     const like = new Like({tweet,user});

//     const savedlikes =await like.save();

//     const updatedTweet = await Tweet.findByIdAndUpdate(tweet,
//         {$push:{likes:savedlikes._id}},
//         {new:true})
//         .populate('likes')
//         .exec();

//         return res.status(200).json( new ApiResponse(200,updatedTweet,"updated likes feteched successfully"))








    
// } catch (error) {

// return res.status(500).json(new ApiError(500,error?.message||"internal server error"));
// }




// });

// const unlikeonpost =asyncHandler(async(req,res)=>{
//     try {

//         const{tweet,like}=req.body;


//         //find and delete th like collection me se

         

//         const deletedLike=await Like.findByIdAndDelete({tweet:tweet,_id:like});


//         const updatedTweet =await Tweet.findByIdAndUpdate(tweet     //vho post jiski find jiski id hai post
//             ,{$pull:                                  //for deletion the likes id we need pull
                                      
//                 {likes:                //likes ki array se vho id delete kr do
//                     deletedLike._id}},{new:true}).populate('likes').exec();         //yeh id delete karna h

//         return res.status(200).json(new ApiResponse(200,updatedTweet,'unlike the post successfully'));

        
//     } catch (error) {
//         return res.status(500).json(new ApiError(500,error?.message|| "failed to unlike the post"))
        
//     }
// })





// export{
//     likesonpost,
//     unlikeonpost
// }