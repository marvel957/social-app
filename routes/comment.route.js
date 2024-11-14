const express = require("express");
const router = express.Router();
// const upload = require("../middlewares/upload");

const {
  createComment,
  createCommentReply,
  updateComment,
  updateReply,
  getAllPostComments,
  deleteComment,
  deleteReply,
  likeComment,
  unlikeComment,
  likeCommentReply,
  unlikeCommentReply,
} = require("../controllers/comment.controller");

//create post route
router.post("/create", createComment);

// create comment reply
router.post("/create/reply/:commentId", createCommentReply);
// update comment
router.put("/update/:commentId", updateComment);
// update a reply
router.put("/update/:commentId/replies/:replyId", updateReply);
// get all post comments
router.get("/post/:postId", getAllPostComments);

//delete a comment
router.delete("/delete/:commentId", deleteComment);
//delete a comment reply
router.delete("/delete/:commentId/reply/:replyId", deleteReply);
// like a comment
router.post("/like/:commentId", likeComment);
// unlike a comment
router.post("/unlike/:commentId", unlikeComment);
router.post("/:commentId/replies/like/:replyId", likeCommentReply);
router.post("/:commentId/replies/unlike/:replyId", unlikeCommentReply);
module.exports = router;
