import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// Define the video schema
const videoSchema = new Schema({
    videoFile: {
      type: String, // Cloudinary URL
      required: true
    },
    thumbnail: {
      type: String, // Cloudinary URL
      required: true
    },
    title: {
      type: String,
      required: true 
    },
    description: {
      type: String,
      required: true 
    },
    duration: {
      type: Number, //cloudinary url
      required: true
    },
    views: {
      type: Number,
      default: 0
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      
    }
  }, { timestamps: true });
  

// Apply pagination plugin
videoSchema.plugin(mongooseAggregatePaginate);

// Export the Video model
export const Video = mongoose.model("Video", videoSchema);
