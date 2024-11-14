const User = require("../models/user");
const Story = require("../models/story");

const { CustomError } = require("../middlewares/error");

const createStory = async (req, res, next) => {
  const { userId } = req.params;
  const { text } = req.body;

  try {
    const user = User.findById(userId);
    if (!user) {
      throw CustomError("No user found", 404);
    }
    let image = "";
    if (req.file) {
      image = process.env.URL + `/uploads/${req.file.filename}`;
    }
    const newStory = new Story({
      user: userId,
      image,
      text,
    });
    await newStory.save();
    return res.status(201).json(newStory);
  } catch (error) {
    next(error);
  }
};

const getStories = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw CustomError("No user found", 404);
    }
    const followingUsers = user.following;
    const stories = await Story.find({
      user: { $in: followingUsers },
    }).populate("user", "fullName username profilePicture");
    return res.status(200).json(stories);
  } catch (error) {
    next(error);
  }
};
const getUserStories = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw CustomError("No user found", 404);
    }
    const stories = await Story.find({ user: userId }).populate(
      "user",
      "fullName username profilePicture"
    );
    return res.status(200).json(stories);
  } catch (error) {
    next(error);
  }
};
const deleteStory = async (req, res, next) => {
  const { storyId } = req.params;

  try {
    await Story.findByIdAndDelete(storyId);
    return res
      .status(200)
      .json({ success: true, message: "story has been successfully deleted" });
  } catch (error) {
    next(error);
  }
};
const deleteStories = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw CustomError("No user found", 404);
    }
    await Story.deleteMany({ user: userId });
    return res
      .status(200)
      .json({
        success: true,
        message: "all stories have been successfully deleted",
      });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStory,
  getStories,
  getUserStories,
  deleteStory,
  deleteStories,
};
