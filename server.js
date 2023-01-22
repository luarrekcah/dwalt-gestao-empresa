const express = require("express"),
  path = require("path"),
  logger = require("morgan"),
  cookieParser = require("cookie-parser"),
  passport = require("passport"),
  session = require("express-session");
 cors = require('cors'),
helmet = require("helmet");

require("dotenv").config()

const app = express();

require('./database.js');
require("./auth/local")(passport);
require('./admin.js');

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//app.use(helmet());
app.use(logger("dev"));
app.use(cors());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "/public/")));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(
  session({
    secret: process.env.cookieSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      //secure: true,
      //httpOnly: true,
      maxAge: 10800000, //3 hours
      //domain: 'dlwalt.com',
    }, 
  })
);

app.use(passport.initialize());
app.use(passport.session());

require("./routes")(app);
require('./services/growatt');
require('./services/sticknotes');
require('./services/notifications');

const listener = app.listen(process.env.PORT || 3000, function () {
  console.log(`[CONNECTION INFO] Porta: ${listener.address().port}`);
});

module.exports = app;

