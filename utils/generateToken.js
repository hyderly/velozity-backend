const jwt = require("jsonwebtoken");

const generateWebToken = id => {
  const token = jwt.sign({ id }, process.env.jwt_secret);
  return token;
};

module.exports = generateWebToken;
