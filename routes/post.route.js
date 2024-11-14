const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");

const {
  createPost,
  createPostWithImages,
  updatePost,
  getPosts,
  getUserPosts,
  deletePost,
  likePost,
  unLikePost,
} = require("../controllers/post.controller");

//create post route
router.post("/create", createPost);

//create post with image...

router.post("/create/:userId", upload.array("images"), createPostWithImages);

// update post
router.put("/update/:postId", updatePost);
// get all post of a certain user
router.get("/all/:userId", getPosts);
// get user post route
router.get("/user/:userId", getUserPosts);

// delete a post
router.delete("/delete/:postId", deletePost);

// like a post
router.post("/like/:postId", likePost);
// unlike a post
router.post("/unlike/:postId", unLikePost);

module.exports = router;
