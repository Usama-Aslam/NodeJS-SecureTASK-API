const express = require("express");

const { mongoose } = require("./db/mongoose");
const { User } = require("./models/User");

const userRoute = require("./routes/UserRoute");

const PORT = process.env.PORT || 3000;
const app = express();

app.use(userRoute);

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
