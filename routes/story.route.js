const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");

const {
  createStory,
  getStories,
  getUserStories,
  deleteStory,
  deleteStories,
} = require("../controllers/story.controller");

router.post("/create/:userId", upload.single("image"), createStory);

//get all stories
router.get("/all/:userId", getStories);

//get this users story
router.get("/user/:userId", getUserStories);
//delete a story
router.delete("/delete/:storyId", deleteStory);

//delete all stories
router.delete("/delete/stories/:userId", deleteStories);

module.exports = router;
