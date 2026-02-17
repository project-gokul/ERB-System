const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // ================= GET AUTH HEADER =================
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing",
      });
    }

    // ================= CHECK BEARER =================
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization format must be: Bearer <token>",
      });
    }

    // ================= EXTRACT TOKEN =================
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }

    // ================= VERIFY TOKEN =================
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ================= ATTACH USER =================
    req.user = {
      id: decoded.id,       // user id
      role: decoded.role,   // student / faculty / admin
      email: decoded.email,
    };

    next();
  } catch (error) {
    console.error("AUTH ERROR:", error.message);

    return res.status(401).json({
      success: false,
      message:
        error.name === "TokenExpiredError"
          ? "Token expired. Please login again."
          : "Invalid token",
    });
  }
};

module.exports = authMiddleware;