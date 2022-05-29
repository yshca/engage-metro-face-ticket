const path = require("path");
const fs = require("fs");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
// const cookieSession = require("cookie-session");
const session = require('express-session')
const cookieParser = require('cookie-parser');
const passport = require("passport");
const multer = require("multer");
const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(__dirname, `${process.env.NODE_ENV}.env`),
});

const authRoutes = require("./routes/auth")
const usersRoutes = require("./routes/users");
const maskRoutes = require("./routes/mask");

require("./controllers/auth")


const cors = require("cors");

const app = express();
app.use(cors({ credentials: true, origin: [process.env.FRONTEND_URL, process.env.FRONTEND_URL_ADMIN] }));
app.use(bodyParser.json());


// app.use(
//   cookieSession({
//     maxAge: 72 * 60 * 60 * 1000,
//     keys: ["somesupersecretkey"],
//     sameSite: "none",
//     secure: false,
//   })
// );
app.use(session({
  secret: 'somesupersecretkey',
  resave: true,
  saveUninitialized: false,
  cookie: {
    maxAge: 6000000000
  },
  
}))

app.use(cookieParser('somesupersecretkey'))

app.use(passport.initialize());
app.use(passport.session());

// Error Handling
app.use((err, req, res, next) => {
  console.log(err);
  const status = err.statusCode || 500;
  const message = err.message;
  const data = err.data;
  res.status(status).json({ message: message, errCode: status, data: data });
});

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/mask", maskRoutes);

// ---- CHECKING SERVER STATUS ---
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send(`Metro eTicket Backend : Mode - ${process.env.NODE_ENV}`);
});

app.listen(PORT, () => {
  console.log(`**** SERVER STARTED AT PORT ${PORT} ****`);
});

// ----- CHECKING IF CONNECTED WITH DATABASE OR CATCH & DISPLAY ERRORS ----
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", (err) => {
  console.log(`**** SOMETHING WENT WRONG **** `);
  console.log(`**** UNABLE TO CONNECT WITH DATABASE ****`);
  console.log(`\n ${err}`);
});

db.once("open", () => {
  console.log("**** CONNECTED WITH DATABASE SUCCESSFULLY ****");
});
