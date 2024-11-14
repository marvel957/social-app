const Post = require("../models/post");
const User = require("../models/user");
const mongoose = require("mongoose");
const { CustomError } = require("../middlewares/error");

function generateFileUrl(filename) {
  return process.env.URL + `/uploads/${filename}`;
}

async function createPost(req, res, next) {
  const { userId, caption } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("user not found", 404);
    }
    const newPost = new Post({
      user: userId,
      caption,
    });
    await newPost.save();
    user.posts.push(newPost._id);
    await user.save();
    return res.status(201).json({ success: true, post: newPost });
  } catch (error) {
    next(error);
  }
}
async function createPostWithImages(req, res, next) {
  const { userId } = req.params;
  const { caption } = req.body;
  const files = req.files;
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("user not found", 404);
    }
    const imageUrls = files.map((file) => generateFileUrl(file.filename));
    const newPost = new Post({
      user: userId,
      caption,
      image: imageUrls,
    });
    await newPost.save();
    user.posts.push(newPost._id);
    await user.save();
    return res.status(201).json({ success: true, post: newPost });
  } catch (error) {
    next(error);
  }
}
async function updatePost(req, res, next) {
  const { postId } = req.params;
  const { caption } = req.body;
  try {
    if (!mongoose.isValidObjectId(postId)) {
      throw new CustomError("invalid post id", 500);
    }
    const postToUpdate = await Post.findById(postId);
    if (!postToUpdate) {
      throw new CustomError("post not found", 404);
    }
    postToUpdate.caption = caption || postToUpdate.caption;
    await postToUpdate.save();
    return res.status(200).json({ success: true, post: postToUpdate });
  } catch (error) {
    next(error);
  }
}
async function getPosts(req, res, next) {
  const { userId } = req.params;
  try {
    if (!mongoose.isValidObjectId(userId)) {
      throw new CustomError("invalid user id", 500);
    }
    const user = await User.findById(userId);

    if (!user) {
      throw new CustomError("user not found", 404);
    }
    const blockedUserIds = user.blockList.map((id) => id.toString());
    const allposts = await Post.find({
      user: { $nin: blockedUserIds },
    }).populate("user", "username fullName profilePicture");

    return res.status(200).json({ success: true, posts: allposts });
  } catch (error) {
    next(error);
  }
}

async function getUserPosts(req, res, next) {
  const { userId } = req.params;
  try {
    if (!mongoose.isValidObjectId(userId)) {
      throw new CustomError("invalid user id", 500);
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("user not found", 404);
    }

    const userPosts = await Post.find({
      user: userId,
    });

    return res.status(200).json({ success: true, posts: userPosts });
  } catch (error) {
    next(error);
  }
}

async function deletePost(req, res, next) {
  const { postId } = req.params;
  try {
    if (!mongoose.isValidObjectId(postId)) {
      throw new CustomError("invalid post id", 500);
    }
    const postToDelete = await Post.findById(postId);
    if (!postToDelete) {
      throw new CustomError("post not found", 404);
    }
    const user = await User.findById(postToDelete.user);
    if (!user) {
      throw new CustomError("user not found", 404);
    }
    user.posts = user.posts.filter(
      (postId) => postId.toString() !== postToDelete._id.toString()
    );
    await user.save();
    await postToDelete.deleteOne();
    return res
      .status(200)
      .json({ success: true, message: "post successfully deleted" });
  } catch (error) {
    next(error);
  }
}
async function likePost(req, res, next) {
  const { postId } = req.params;
  const { userId } = req.body;
  try {
    if (!mongoose.isValidObjectId(postId)) {
      throw new CustomError("invalid post id", 500);
    }
    if (!mongoose.isValidObjectId(userId)) {
      throw new CustomError("invalid post id", 500);
    }
    const post = await Post.findById(postId);
    if (!post) {
      throw new CustomError("post not found", 404);
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("user not found", 404);
    }
    if (post.likes.includes(userId)) {
      throw new CustomError("you've already liked this post", 404);
    }
    post.likes.push(userId);
    await post.save();
    return res
      .status(200)
      .json({ success: true, message: "you liked the post" });
  } catch (error) {
    next(error);
  }
}
async function unLikePost(req, res, next) {
  const { postId } = req.params;
  const { userId } = req.body;
  try {
    if (!mongoose.isValidObjectId(postId)) {
      throw new CustomError("invalid post id", 500);
    }
    if (!mongoose.isValidObjectId(userId)) {
      throw new CustomError("invalid post id", 500);
    }
    const post = await Post.findById(postId);
    if (!post) {
      throw new CustomError("post not found", 404);
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("user not found", 404);
    }
    if (!post.likes.includes(userId)) {
      throw new CustomError("you have not like the post", 404);
    }
    post.likes = post.likes.filter((id) => id.toString() !== userId);
    await post.save();
    return res
      .status(200)
      .json({ success: true, message: "you have unliked the post" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createPost,
  createPostWithImages,
  updatePost,
  getPosts,
  getUserPosts,
  deletePost,
  likePost,
  unLikePost,
};
