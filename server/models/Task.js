const { mongoose } = require("./../db/mongoose");

const TaskSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    default: null,
    trim: true,
    minlength: 1
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number,
    default: null
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Users"
  }
});

const Task = mongoose.model("Tasks", TaskSchema);

module.exports = { Task };
