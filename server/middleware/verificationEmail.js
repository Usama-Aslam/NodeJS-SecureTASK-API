const cryptoRandomString = require("crypto-random-string");
const nodemailer = require("nodemailer");

const { User } = require("../models/User");

let rand, mailOptions, host, link;

const smtpTransport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.GMAIL_ID,
    pass: process.env.GMAIL_Pass
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendEmailLink = async (req, res, next) => {
  rand = cryptoRandomString({ length: 30, type: "hex" });
  host = req.get("host");
  link = `http://${host}/user/verify?id=${rand}`;

  mailOptions = {
    to: req.user.email,
    subject: `Please Verify Your Email`,
    html:
      "Hello,<br> Please Click on the link to verify your email.<br><a href=" +
      link +
      ">Click here to verify</a>"
  };
  console.log(mailOptions);

  smtpTransport.sendMail(mailOptions, (err, response) => {
    try {
      if (err) {
        return res.status(400).end(err);
      }
      req.user
        .updateOne(
          {
            $set: {
              "emailVerified.token": rand
            }
          },
          { new: true }
        )
        .then(user => {
          next();
        });
    } catch (error) {
      res.status(400).end(error);
    }
  });
};

const verifyEmailLink = (req, res, next) => {
  const { email, emailVerified } = req.user;
  if (
    `${req.protocol}://${req.get("host")}` === `http://${req.get("host")}` &&
    req.query.id == emailVerified.token
  ) {
    req.user
      .updateOne(
        {
          $set: {
            "emailVerified.isVerified": true
          }
        },
        { new: true }
      )
      .then(() => {
        console.log("email verified");
        next();
      });
  } else {
    console.log("email is not verified");
    res.send({ error: "Bad request" });
  }
};

module.exports = { sendEmailLink, verifyEmailLink };
