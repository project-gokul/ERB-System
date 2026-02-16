const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ❌ No token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authorization token missing ❌",
      });
    }

    // ✅ Extract token
    const token = authHeader.split(" ")[1];

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Attach user info
    req.user = decoded;

    next();
  } catch (error) {
    console.error("AUTH ERROR:", error);
    res.status(401).json({
      message: "Invalid or expired token ❌",
    });
  }
};

module.exports = authMiddleware;
