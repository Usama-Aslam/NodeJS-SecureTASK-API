const { User } = require("../models/User");

const authentication = async (req, res, next) => {
  let token = req.header("x-auth");

  try {
    const user = await User.findByToken(token);
    if (!user) return Promise.reject({ error: "user not found" });

    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    res.status(401).send(error);
  }
};

module.exports = {
  authentication
};
