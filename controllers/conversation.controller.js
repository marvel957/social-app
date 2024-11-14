const Conversation = require("../models/conversation");
const User = require("../models/user");
const Message = require("../models/message");

const { CustomError } = require("../middlewares/error");

async function createConversation(req, res, next) {
  try {
    if (req.body.firstUser === req.body.secondUser) {
      throw new CustomError("sender and receiver cannot be the same", 400);
    }

    let newConversation = new Conversation({
      participants: [req.body.firstUser, req.body.secondUser],
    });
    const savedConversation = await newConversation.save();

    return res.status(201).json(savedConversation);
  } catch (error) {
    next(error);
  }
}

async function getConversationOfUser(req, res, next) {
  try {
    const conversations = await Conversation.find({
      participants: { $in: [req.params.userId] },
    });

    return res.status(200).json(conversations);
  } catch (error) {
    next(error);
  }
}
async function getTwoUsersConversation(req, res, next) {
  try {
    const conversation = await Conversation.find({
      participants: { $all: [req.params.firstUserId, req.params.secondUserId] },
    });

    return res.status(200).json(conversation);
  } catch (error) {
    next(error);
  }
}
async function deleteConversation(req, res, next) {
  const { conversationId } = req.params;
  try {
    await Conversation.deleteOne({ _id: conversationId });
    await Message.deleteMany({ conversationId });

    return res
      .status(200)
      .json({ success: true, message: "conversation deleted successfully" });
  } catch (error) {
    next(error);
  }
}
module.exports = {
  createConversation,
  getConversationOfUser,
  getTwoUsersConversation,
  deleteConversation,
};
