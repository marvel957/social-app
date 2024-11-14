const Conversation = require("../models/conversation");
const User = require("../models/user");
const Message = require("../models/message");

async function createMessage(req, res, next) {
  const newMessage = new Message(req.body);
  try {
    const savedMessage = await newMessage.save();

    return res.status(201).json(savedMessage);
  } catch (error) {
    next(error);
  }
}
async function getMessages(req, res, next) {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });

    return res.status(200).json({ success: true, messages: messages });
  } catch (error) {
    next(error);
  }
}
async function deleteMessages(req, res, next) {
  try {
    await Message.findByIdAndDelete(req.params.messageId);

    return res
      .status(201)
      .json({ success: true, message: "message successfully deleted" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createMessage,
  getMessages,
  deleteMessages,
};
