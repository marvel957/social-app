const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");

const {
  getUser,
  updateUser,
  followUser,
  unFollowUser,
  blockUser,
  unBlockUser,
  getBlockList,
  deleteUser,
  searchUser,
  uploadProfilePicture,
  uploadCoverPicture,
} = require("../controllers/user.controller");

//get user
router.get("/:userId", getUser);

//update user route
router.put("/:userId", updateUser);

// follow user
router.post("/follow/:userId", followUser);
// unfollow user
router.post("/unfollow/:userId", unFollowUser);
// block
router.post("/block/:userId", blockUser);
// unblock user
router.post("/unblock/:userId", unBlockUser);
// get block list
router.get("/blocked/:userId", getBlockList);
//delete a user
router.delete("/delete/:userId", deleteUser);
router.get("/search/:query", searchUser);
// update profile pic
router.put(
  "/update-profile-picture/:userId",
  upload.single("profilePicture"),
  uploadProfilePicture
);
// update cover pic
router.put(
  "/update-cover-picture/:userId",
  upload.single("coverPicture"),
  uploadCoverPicture
);

module.exports = router;
