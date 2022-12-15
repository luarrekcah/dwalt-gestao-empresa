const express = require("express"),
  path = require("path"),
  logger = require("morgan"),
  cookieParser = require("cookie-parser"),
  passport = require("passport"),
  session = require("express-session");
  
const app = express();

require('./database.js');
require("./auth/local")(passport);
require('./admin.js');
require('./services/growatt');

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "/public/")));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(
  session({
    secret: "123",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 86400000 }, //24 hours
  })
);

app.use(passport.initialize());
app.use(passport.session());

require("./routes")(app);
require('./services/sticknotes');

const listener = app.listen(process.env.PORT || 3000, function () {
  console.log(`[CONNECTION INFO] Porta: ${listener.address().port}`);
});

module.exports = app;

