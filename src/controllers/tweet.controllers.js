import { Tweet } from "../models/tweets.model.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createtweet = asyncHandler(async(req,res)=>{

try {



    const{owner,body}= req.body;


    const newtweet = new Tweet({owner,body,likes:[],unlike:[]});

    const savedTweet = await newtweet.save();

    const populatedTweet = await Tweet.findById(savedTweet._id)
            // .populate('likes')
            // .exec();




    return res.status(200).json(new ApiResponse(200,populatedTweet,"tweet create successfully"));
    
} catch (error) {

console.error('error while creating tweet',error);
return res.status(500).json(new ApiError (500,error?.message||'internal server error'))    
}

})

const getAllUserTweet = asyncHandler(async (req, res) => {
    try {
        // Log the entire request object to debug
        console.log('Request Params:', req.params);
        console.log('Request URL:', req.url);

        const { owner } = req.params;

        if (!owner) {
            return res.status(400).json(new ApiError(400, 'Owner parameter is missing'));
        }

        // Use find to get all tweets by owner
        const tweets = await Tweet.find({ owner: owner });
        // .populate("body").exec();

        console.log(`Tweets found: ${tweets.length}`);

        return res.status(200).json(new ApiResponse(200, tweets, "Get all tweets successfully"));
    } catch (error) {
        console.error(`Error fetching tweets: ${error.message}`);
        return res.status(500).json(new ApiError(500, error?.message || 'Internal server error'));
    }
});




export{createtweet,getAllUserTweet}