const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const chatController = require("../controllers/chatController");

router.post("/", authMiddleware, chatController.handleChat);

module.exports = router;