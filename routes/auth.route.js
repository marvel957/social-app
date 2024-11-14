const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  refetchUser,
} = require("../controllers/auth.controller");

router.post("/register", register);
router.post("/login", login);

// log out
router.get("/logout", logout);
// fetch current user
router.get("/refetch", refetchUser);

module.exports = router;
