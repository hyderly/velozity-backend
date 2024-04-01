const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10000,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = limiter;
