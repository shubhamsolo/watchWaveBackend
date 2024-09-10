import mongoose, { Schema } from "mongoose";

const tweetSchema = new Schema({

    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    body:{
        type:String,
        required:true
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Like',
            
        }
    ], 
    
  

},{timestamps:true})

export const Tweet =mongoose.model("Tweet",tweetSchema);