const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

mongoose
  .connect("mongodb://localhost:27017/TaskList", {
    useNewUrlParser: true
  })
  .then(() => console.log("=====mongodb connected====="))
  .catch(e => console.log("Unable to Connect"));

module.exports = {
  mongoose
};
