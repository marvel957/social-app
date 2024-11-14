const jwt = require("jsonwebtoken");
const { CustomError } = require("../middlewares/error");

const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      throw new CustomError("You are not authenticated", 401); // Change status code to 401 (Unauthorized)
    }

    jwt.verify(token, process.env.KEY, (error, data) => {
      if (error) {
        throw new CustomError("Token is invalid", 403); // Forbidden error code
      }

      req.userId = data._id;
      next();
    });
  } catch (err) {
    next(err); // Pass the error to the next middleware (global error handler)
  }
};

module.exports = verifyToken;
