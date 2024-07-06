import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Debugging statements to log cookies and authorization header
    console.log("Cookies:", req.cookies);
    console.log("Authorization Header:", req.header("authorization"));

    // Attempt to retrieve the token from cookies or authorization header
    const token = req.cookies?.accessToken || req.header("authorization")?.replace("Bearer ", "");

    // Check if token is present
    if (!token) {
      console.error("No token provided in cookies or authorization header");
      throw new ApiError(401, "Unauthorized request");
    }

    // Verify the token using the secret key
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Find the user associated with the token
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    // Check if user exists
    if (!user) {
      console.error("User not found for provided token");
      throw new ApiError(401, "Invalid Access Token");
    }

    // Attach user to the request object
    req.user = user;
    next();
  } 
  catch (error) {
    // Log the error details
    console.error("Error verifying token:", error);
    next(new ApiError(401, error?.message || "Invalid access token"));
  }
});
