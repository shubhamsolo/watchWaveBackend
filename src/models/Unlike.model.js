import mongoose, { Schema } from "mongoose";

const UnlikeSchema= new Schema({

    tweet:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Tweet",
    },
    user:{
          type:String,
          unique:true
    }
    
   




},{timestamps:true})



export const Unlike =mongoose.model("Unlike",UnlikeSchema);