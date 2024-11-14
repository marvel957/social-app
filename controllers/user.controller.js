const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment");
const Story = require("../models/story");

const { CustomError } = require("../middlewares/error");
const mongoose = require("mongoose");

async function getUser(req, res, next) {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
      throw new CustomError("invalid user id", 404);
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("no user found", 404);
    }
    const { password, ...data } = user;
    return res.status(200).json(data._doc);
  } catch (error) {
    next(error);
  }
}
async function updateUser(req, res, next) {
  const { userId } = req.params;
  const userData = req.body;
  try {
    if (!mongoose.isValidObjectId(userId)) {
      throw new CustomError("invalid user id", 404);
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("no user found", 404);
    }
    Object.assign(user, userData);
    await user.save();
    return res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    next(error);
  }
}
async function followUser(req, res, next) {
  const { userId } = req.params;
  const { _id } = req.body;
  try {
    if (userId === _id) {
      throw new CustomError("you cannot follow youself", 500);
    }
    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(_id)) {
      throw new CustomError("invalid user id", 404);
    }

    const userToFollow = await User.findById(userId);
    const loggedInUser = await User.findById(_id);
    if (!userToFollow || !loggedInUser) {
      throw new CustomError("no user found", 404);
    }
    if (loggedInUser.following.includes(userId))
      throw new CustomError("Already following this user", 400);

    loggedInUser.following.push(userId);
    userToFollow.followers.push(_id);

    await loggedInUser.save();
    await userToFollow.save();

    return res.status(200).json({ message: "successfully followed the user" });
  } catch (error) {
    next(error);
  }
}
async function unFollowUser(req, res, next) {
  const { userId } = req.params;
  const { _id } = req.body;
  try {
    if (userId === _id) {
      throw new CustomError("you cannot unfollow youself", 500);
    }
    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(_id)) {
      throw new CustomError("invalid user id", 404);
    }

    const userToUnFollow = await User.findById(userId);
    const loggedInUser = await User.findById(_id);
    if (!userToUnFollow || !loggedInUser) {
      throw new CustomError("no user found", 404);
    }
    if (!loggedInUser.following.includes(userId))
      throw new CustomError("not following this user", 400);

    loggedInUser.following = loggedInUser.following.filter(
      (id) => id.toString() !== userId
    );
    userToUnFollow.followers = userToUnFollow.followers.filter(
      (id) => id.toString() !== _id
    );

    await loggedInUser.save();
    await userToUnFollow.save();

    return res.status(200).json({ message: "successfully ufollowed the user" });
  } catch (error) {
    next(error);
  }
}
async function blockUser(req, res, next) {
  const { userId } = req.params;
  const { _id } = req.body;
  try {
    if (userId === _id) {
      throw new CustomError("you cannot block yourself", 500);
    }
    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(_id)) {
      throw new CustomError("invalid user id", 404);
    }

    const userToBlock = await User.findById(userId);
    const loggedInUser = await User.findById(_id);
    if (!userToBlock || !loggedInUser) {
      throw new CustomError("no user found", 404);
    }
    if (loggedInUser.blockList.includes(userId)) {
      throw new CustomError("already blocked this user", 400);
    }
    loggedInUser.blockList.push(userId);
    loggedInUser.following = loggedInUser.following.filter(
      (id) => id.toString() !== userId
    );
    userToBlock.followers = userToBlock.followers.filter(
      (id) => id.toString() !== _id
    );
    await loggedInUser.save();
    await userToBlock.save();

    return res.status(200).json({ message: "successfully blocked this user" });
  } catch (error) {
    next(error);
  }
}
async function unBlockUser(req, res, next) {
  const { userId } = req.params;
  const { _id } = req.body;
  try {
    if (userId === _id) {
      throw new CustomError("you cannot block or unblock yourself", 500);
    }
    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(_id)) {
      throw new CustomError("invalid user id", 404);
    }

    const userToUnBlock = await User.findById(userId);
    const loggedInUser = await User.findById(_id);
    if (!userToUnBlock || !loggedInUser) {
      throw new CustomError("no user found", 404);
    }
    if (!loggedInUser.blockList.includes(userId)) {
      throw new CustomError("this user is not blocked.", 500);
    }
    loggedInUser.blockList = loggedInUser.blockList.filter(
      (id) => id.toString() !== userId
    );

    await loggedInUser.save();
    return res
      .status(200)
      .json({ message: "successfully un blocked this user" });
  } catch (error) {
    next(error);
  }
}
async function getBlockList(req, res, next) {
  const { userId } = req.params;
  try {
    if (!mongoose.isValidObjectId(userId)) {
      throw new CustomError("invalid user id", 404);
    }

    const user = await User.findById(userId).populate(
      "blockList",
      "username fullName profilePicture"
    );
    if (!user) {
      throw new CustomError("user not found", 404);
    }
    const { blockList, ...data } = user;

    return res.status(200).json(blockList);
  } catch (error) {
    next(error);
  }
}
async function deleteUser(req, res, next) {
  const { userId } = req.params;
  try {
    if (!mongoose.isValidObjectId(userId)) {
      throw new CustomError("invalid user id", 404);
    }

    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      throw new CustomError("user not found", 404);
    }
    await Post.deleteMany({ user: userId });
    await Post.deleteMany({ "comments.user": userId });
    await Post.deleteMany({ "comments.replies.user": userId });
    await Comment.deleteMany({ user: userId });
    await Story.deleteMany({ user: userId });
    await Post.updateMany({ likes: userId }, { $pull: { likes: userId } });
    await User.updateMany(
      { _id: { $in: userToDelete.following } },
      { $pull: { followers: userId } }
    );
    await Comment.updateMany({}, { $pull: { likes: userId } });
    await Comment.updateMany(
      { "replies.likes": userId },
      { $pull: { "replies.likes": userId } }
    );
    await Post.updateMany({}, { $pull: { likes: userId } });
    const replyComments = await Comment.find({ "replies.user": userId });
    await Promise.all(
      replyComments.map(async (comment) => {
        comment.replies = comment.replies.filter(
          (reply) => reply.user.toString() != userId
        );
        await comment.save();
      })
    );
    await userToDelete.deleteOne();

    return res
      .status(200)
      .json({ success: true, message: "user successfully deleted" });
  } catch (error) {
    next(error);
  }
}
async function searchUser(req, res, next) {
  const { query } = req.params;
  try {
    const users = await User.find({
      $or: [
        { username: { $regex: new RegExp(query, "i") } },
        { fullName: { $regex: new RegExp(query, "i") } },
      ],
    });
    if (users.length < 1) {
      return res.status(404).json({ message: "no users found" });
    }

    return res.status(200).json(users);
  } catch (error) {
    next(error);
  }
}

function generateFileUrl(filename) {
  return process.env.URL + `/uploads/${filename}`;
}
async function uploadProfilePicture(req, res, next) {
  const { userId } = req.params;
  const { filename } = req.file;
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: generateFileUrl(filename) },
      { new: true }
    );
    if (!user) {
      throw new CustomError("No user found", 404);
    }
    res
      .status(200)
      .json({ message: "profile picture updated successfully", user });
  } catch (error) {
    next(error);
  }
}
async function uploadCoverPicture(req, res, next) {
  const { userId } = req.params;
  const { filename } = req.file;
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { coverPicture: generateFileUrl(filename) },
      { new: true }
    );
    if (!user) {
      throw new CustomError("No user found", 404);
    }
    res
      .status(200)
      .json({ message: "cover picture updated successfully", user });
  } catch (error) {
    next(error);
  }
}
module.exports = {
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
};
