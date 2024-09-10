import mongoose, { Schema } from "mongoose";

const likeSchema= new Schema({

    tweet:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Tweet",
    },
    user:{
          type:String,
          unique:true
    }
    
   




},{timestamps:true})



export const Like =mongoose.model("Like",likeSchema);