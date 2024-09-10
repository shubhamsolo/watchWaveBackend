import { Router } from "express";
import {
  logoutUser,
  loginUser,
  registerUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDeatails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  videoUpload,
  
  getAllUserVideos,
  getAllVideo,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewere.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createtweet, getAllUserTweet } from "../controllers/tweet.controllers.js";
// import { likesonpost } from "../controllers/like.controller.js";

const router = Router();

router.route("/register").post(
  //yaha par ek middleware add kr rahai h mtlab ki register user se pehele ek middle ware

  upload.fields([
    //do files cover kr rahai h
    {
      name: "avatar",
      maxCount: 1, //kitni files chahiye
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser);
//creating a endpoint for token refersh
router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDeatails);
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/cover-IMage")
  .patch(verifyJWT, upload.single("/coverImage"), updateUserCoverImage);


router.route("/c/:username").get(verifyJWT, getUserChannelProfile);


router.route("/history").get(verifyJWT, getWatchHistory);


router.route("/create/tweet").post(verifyJWT,createtweet);

router.route("/gettweet/:owner").get(verifyJWT,getAllUserTweet);

// router.route('/liketweet').post(verifyJWT,likesonpost);
// router.route('/unlikeontweet').post(verifyJWT,unlikeonpost);



router.route("/videoUpload").post(verifyJWT,upload.single("videoFile"), videoUpload);

router.route('/getAllUserVideo/:owner').get(verifyJWT,getAllUserVideos);

router.route('/getAllVideo').get(getAllVideo);




export default router;
