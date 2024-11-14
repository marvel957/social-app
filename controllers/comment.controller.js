const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment");
const mongoose = require("mongoose");
const { CustomError } = require("../middlewares/error");

// function generateFileUrl(filename) {
//   return process.env.URL + `/uploads/${filename}`;
// }

async function createComment(req, res, next) {
  const { postId, userId, text } = req.body;
  try {
    if (!mongoose.isValidObjectId(userId)) {
      throw new CustomError("invalid user id", 500);
    }
    if (!mongoose.isValidObjectId(postId)) {
      throw new CustomError("invalid post id", 500);
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("user not found", 404);
    }
    const post = await Post.findById(postId);
    if (!post) {
      throw new CustomError("post not found", 404);
    }
    const newComment = new Comment({
      user: userId,
      post: postId,
      text,
    });
    await newComment.save();
    post.comments.push(newComment._id);
    await post.save();
    return res.status(201).json({ success: true, comment: newComment });
  } catch (error) {
    next(error);
  }
}
async function createCommentReply(req, res, next) {
  const { userId, text } = req.body;
  const { commentId } = req.params;
  try {
    if (!mongoose.isValidObjectId(userId)) {
      throw new CustomError("invalid user id", 500);
    }
    if (!mongoose.isValidObjectId(commentId)) {
      throw new CustomError("invalid comment id", 500);
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("user not found", 404);
    }
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      throw new CustomError("parent comment not found!", 404);
    }
    const reply = {
      user: userId,
      text,
    };

    parentComment.replies.push(reply);
    await parentComment.save();
    return res.status(201).json({ success: true, reply });
  } catch (error) {
    next(error);
  }
}
async function updateComment(req, res, next) {
  const { text } = req.body;
  const { commentId } = req.params;
  try {
    if (!mongoose.isValidObjectId(commentId)) {
      throw new CustomError("invalid comment id", 500);
    }

    const commentToUpdate = await Comment.findById(commentId);
    if (!commentToUpdate) {
      throw new CustomError("comment not found!", 404);
    }
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { text },
      { new: true }
    );

    return res.status(200).json({ success: true, updatedComment });
  } catch (error) {
    next(error);
  }
}
async function updateReply(req, res, next) {
  const { text, userId } = req.body;
  const { commentId, replyId } = req.params;
  try {
    if (!mongoose.isValidObjectId(commentId)) {
      throw new CustomError("invalid comment id", 500);
    }
    if (!mongoose.isValidObjectId(replyId)) {
      throw new CustomError("invalid reply id", 500);
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new CustomError("comment not found!", 404);
    }
    const replyIndex = comment.replies.findIndex(
      (reply) => reply._id.toString() === replyId
    );
    if (replyIndex === -1) {
      throw new CustomError("reply not found!", 404);
    }
    if (comment.replies[replyIndex].user.toString() !== userId) {
      throw new CustomError("you can only update your comments", 404);
    }
    comment.replies[replyIndex].text = text;
    await comment.save();
    return res.status(200).json({ success: true, comment });
  } catch (error) {
    next(error);
  }
}
//// populate function
async function populateUserDetails(comments) {
  for (const comment of comments) {
    await comment.populate("user", "username fullName profilePicture");
    if (comment.replies.length > 0) {
      await comment.populate(
        "replies.user",
        "username fullName profilePicture"
      );
    }
  }
}

async function getAllPostComments(req, res, next) {
  const { postId } = req.params;
  try {
    if (!mongoose.isValidObjectId(postId)) {
      throw new CustomError("invalid post id", 500);
    }

    const post = await Post.findById(postId);
    if (!post) {
      throw new CustomError("post not found!", 404);
    }
    let comments = await Comment.find({ post: postId });
    await populateUserDetails(comments);
    return res.status(200).json({ success: true, comments });
  } catch (error) {
    next(error);
  }
}
async function deleteComment(req, res, next) {
  const { commentId } = req.params;
  try {
    if (!mongoose.isValidObjectId(commentId)) {
      throw new CustomError("invalid comment id", 500);
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new CustomError("comment not found!", 404);
    }
    await Post.findOneAndUpdate(
      { comments: commentId },
      { $pull: { comments: commentId } },
      { new: true }
    );
    await comment.deleteOne();
    return res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
}
async function deleteReply(req, res, next) {
  const { commentId, replyId } = req.params;
  try {
    if (!mongoose.isValidObjectId(commentId)) {
      throw new CustomError("invalid comment id", 500);
    }
    if (!mongoose.isValidObjectId(replyId)) {
      throw new CustomError("invalid reply id", 500);
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new CustomError("comment not found!", 404);
    }
    comment.replies = comment.replies.filter(
      (reply) => reply._id.toString() !== replyId
    );
    await comment.save();
    return res
      .status(200)
      .json({ success: true, message: "reply successfully deleted" });
  } catch (error) {
    next(error);
  }
}
async function likeComment(req, res, next) {
  const { commentId } = req.params;
  const { userId } = req.body;
  try {
    if (!mongoose.isValidObjectId(commentId)) {
      throw new CustomError("invalid comment id", 500);
    }
    if (!mongoose.isValidObjectId(userId)) {
      throw new CustomError("invalid user id", 500);
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new CustomError("comment not found!", 404);
    }
    if (comment.likes.includes(userId)) {
      throw new CustomError("already liked the comment", 400);
    }
    comment.likes.push(userId);
    await comment.save();
    return res
      .status(200)
      .json({ success: true, message: "comment liked", comment });
  } catch (error) {
    next(error);
  }
}
async function unlikeComment(req, res, next) {
  const { commentId } = req.params;
  const { userId } = req.body;
  try {
    if (!mongoose.isValidObjectId(commentId)) {
      throw new CustomError("invalid comment id", 500);
    }
    if (!mongoose.isValidObjectId(userId)) {
      throw new CustomError("invalid user id", 500);
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new CustomError("comment not found!", 404);
    }
    if (!comment.likes.includes(userId)) {
      throw new CustomError("you did not like the comment", 400);
    }
    comment.likes = comment.likes.filter((id) => id.toString() !== userId);
    await comment.save();
    return res
      .status(200)
      .json({ success: true, message: "comment unliked", comment });
  } catch (error) {
    next(error);
  }
}
async function likeCommentReply(req, res, next) {
  const { commentId, replyId } = req.params;
  const { userId } = req.body;
  try {
    if (!mongoose.isValidObjectId(commentId)) {
      throw new CustomError("invalid comment id", 500);
    }
    if (!mongoose.isValidObjectId(userId)) {
      throw new CustomError("invalid user id", 500);
    }
    if (!mongoose.isValidObjectId(replyId)) {
      throw new CustomError("invalid reply id", 500);
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new CustomError("comment not found!", 404);
    }
    const replyComment = comment.replies.id(replyId);
    if (!replyComment) {
      throw new CustomError("reply not found!", 404);
    }
    if (replyComment.likes.includes(userId)) {
      throw new CustomError("you already liked reply!", 400);
    }
    replyComment.likes.push(userId);

    await comment.save();
    res
      .status(200)
      .json({ success: true, message: "reply successfully liked", comment });
    return res
      .status(200)
      .json({ success: true, message: "comment unliked", comment });
  } catch (error) {
    next(error);
  }
}
async function unlikeCommentReply(req, res, next) {
  const { commentId, replyId } = req.params;
  const { userId } = req.body;
  try {
    if (!mongoose.isValidObjectId(commentId)) {
      throw new CustomError("invalid comment id", 500);
    }
    if (!mongoose.isValidObjectId(userId)) {
      throw new CustomError("invalid user id", 500);
    }
    if (!mongoose.isValidObjectId(replyId)) {
      throw new CustomError("invalid reply id", 500);
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new CustomError("comment not found!", 404);
    }
    const replyComment = comment.replies.id(replyId);
    if (!replyComment) {
      throw new CustomError("reply not found!", 404);
    }
    if (!replyComment.likes.includes(userId)) {
      throw new CustomError("you did not like this reply!", 400);
    }
    replyComment.likes = replyComment.likes.filter(
      (id) => id.toString() !== userId
    );

    await comment.save();
    res
      .status(200)
      .json({ success: true, message: "reply successfully liked", comment });
    return res
      .status(200)
      .json({ success: true, message: "comment unliked", comment });
  } catch (error) {
    next(error);
  }
}
module.exports = {
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
};
