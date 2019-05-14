const cryptoRandomString = require("crypto-random-string");
const nodemailer = require("nodemailer");

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

const emailAuthentication = async (req, res, next) => {
  rand = cryptoRandomString({ length: 30, type: "hex" });
  host = req.get("host");
  link = `http://${host}/user/verify?id=${rand}`;

  mailOptions = {
    to: "uaslam345@gmail.com",
    subject: `Please Verify Your Email`,
    html:
      "Hello,<br> Please Click on the link to verify your email.<br><a href=" +
      link +
      ">Click here to verify</a>"
  };
  console.log(mailOptions);

  smtpTransport.sendMail(mailOptions, (err, response) => {
    if (err) {
      return Promise.reject(err);
    } else {
      next();
    }
  });
};

const verificationEmail = (req, res, next) => {
  if (`${req.protocol}://${req.get("host")}` === `http://${host}`) {
    console.log("Domain is matched. Information is from Authentic email");
    if (req.query.id == rand) {
      console.log("email is verified");
      res.end("Email " + mailOptions.to + " is been Successfully verified");
    } else {
      console.log("email is not verified");
      res.end("Bad Request");
    }
  } else {
    res.end("<h1>Request is from unknown source");
  }
};

module.exports = { emailAuthentication, verificationEmail };
