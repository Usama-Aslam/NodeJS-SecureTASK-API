const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const _ = require("lodash");

const { mongoose } = require("../db/mongoose");
const SECRET = "123abc";

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
      if (value.toLowerCase() === "password") {
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

UserSchema.methods.toJSON = function() {
  const user = this;
  //converting mongoose document into object so that we can get values from object
  const userObject = user.toObject();

  console.log(userObject);

  //returning only email and id from the document
  return _.pick(userObject, ["_id", "email"]);
};

//-----------Mongoose MiddleWare-------------

UserSchema.pre("save", function(next) {
  let user = this;

  if (user.isModified("password")) {
    bcrypt.genSalt(10, (error, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

//-------------------------------------------

//----------Instance Methods-----------

UserSchema.methods.generateAuthToken = function() {
  let user = this;
  const access = "auth";

  let token = jwt.sign({ _id: user._id.toHexString(), access }, SECRET);
  user.tokens.push({ token, access });

  return user.save().then(doc => token);
};

//------------------------------------

const User = mongoose.model("Users", UserSchema);

module.exports = { User };
