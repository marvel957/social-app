const express = require("express");
const router = express.Router();

const User = require("../models/user");
const Message = require("../models/message");
const Conversation = require("../models/conversation");

const {
  createMessage,
  getMessages,
  deleteMessages,
} = require("../controllers/message.controller");

// create message
router.post("/create", createMessage);
// get messages
router.get("/:conversationId", getMessages);
//delete message
router.delete("/:messageId", deleteMessages);

module.exports = router;
