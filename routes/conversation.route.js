const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const User = require("../models/user");
const Conversation = require("../models/conversation");

const {
  createConversation,
  getConversationOfUser,
  getTwoUsersConversation,
  deleteConversation,
} = require("../controllers/conversation.controller");

router.post("/create", createConversation);

//get conversation of user
router.get("/:userId", getConversationOfUser);
//get conversation of 2 users
router.get("/:firstUserId/:secondUserId", getTwoUsersConversation);
//delete conversation by Id
router.delete("/delete/:conversationId", deleteConversation);

module.exports = router;
