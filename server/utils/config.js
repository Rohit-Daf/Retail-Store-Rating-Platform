const config = {
  saltRounds: parseInt(process.env.SALT_ROUNDS) || 10,
  secret: process.env.JWT_SECRET,
};

module.exports = config;
