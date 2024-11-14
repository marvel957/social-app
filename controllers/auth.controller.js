const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { CustomError } = require("../middlewares/error");

const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      throw new CustomError("invalid credentials", 500);
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      throw new CustomError("username or email already taken", 400);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ ...req.body, password: hashedPassword });
    const createdUser = await newUser.save();

    return res.status(201).json(createdUser);
  } catch (error) {
    next(error);
  }
};
const login = async (req, res, next) => {
  try {
    let user;
    if (req.body.email) {
      user = await User.findOne({ email: req.body.email });
    } else {
      user = await User.findOne({ username: req.body.username });
    }

    if (!user) {
      throw new CustomError("user not found!", 404);
    }
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) throw new CustomError("invalid credentials", 401);

    const { password, ...data } = user._doc;

    const token = jwt.sign({ _id: user._id }, process.env.KEY, {
      expiresIn: process.env.KEY_EXPIRES,
    });
    return res.cookie("token", token).status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res
      .clearCookie("token", { sameSite: "none", secure: true })
      .status(200)
      .json("user loged out successfully");
  } catch (error) {
    next(error);
  }
};

const refetchUser = async (req, res) => {
  const token = req.cookies.token;
  jwt.verify(token, process.env.KEY, {}, async (error, data) => {
    if (error) {
      throw new CustomError(error, 404);
    }
    try {
      const id = data._id;
      const user = await User.findById(id);
      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  });
};

module.exports = { register, login, logout, refetchUser };
