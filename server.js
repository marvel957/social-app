const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieparser = require("cookie-parser");
const path = require("path");
const verifyToken = require("./middlewares/verifyToken");

const authRoute = require("./routes/auth.route");
const userRoute = require("./routes/user.route");
const postRoute = require("./routes/post.route");
const CommentRoute = require("./routes/comment.route");
const storyRoute = require("./routes/story.route");
const conversationRoute = require("./routes/conversation.route");
const messageRoute = require("./routes/message.route");
const { errorHandler } = require("./middlewares/error");

dotenv.config();
const app = express();

mongoose.connection.once("open", () => {
  console.log("connection successful");
});
mongoose.connection.on("error", (error) => {
  console.log(error.message);
});
///middlewares
app.use(express.json());
app.use(cookieparser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//routes
app.use("/api/auth", authRoute);
app.use("/api/user", verifyToken, userRoute);
app.use("/api/post", verifyToken, postRoute);
app.use("/api/comment", verifyToken, CommentRoute);
app.use("/api/story", verifyToken, storyRoute);
app.use("/api/conversation", verifyToken, conversationRoute);
app.use("/api/message", verifyToken, messageRoute);

app.use(errorHandler);

async function startServer() {
  console.log(process.env.db_URI);
  await mongoose.connect(process.env.db_URI);
  app.listen(process.env.PORT, () => {
    console.log(`server running on port ${process.env.PORT}`);
  });
}
startServer();
