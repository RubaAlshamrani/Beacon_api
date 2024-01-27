const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify JWT and protect routes
module.exports = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split("Bearer ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "please provide your token in header", code: 401 });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: err, code: 403 });
    }

    if (user.role != "instructor") {
      return res.status(403).json({ message: "you are not instructor", code: 403 });

    }

    req.user = user;
    next();
  });
};
