const validator = require("validator");

const { mongoose } = require("../db/mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    default: null,
    minlength: 2,
    validate: {
      validator: validator.isEmail,
      message: "{VALUE} is not a valid email"
    }
  },
  password: {
    type: String,
    trim: true,
    required: true,
    minlength: 3,
    validate(value) {
      if (value.toLowercase() === "password") {
        throw new Error("password can't be 'password'");
      }
    }
  },
  tokens: [
    {
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }
  ]
});

const User = mongoose.model("Users", UserSchema);

module.exports == { User };
