const express = require("express"),
  path = require("path"),
  logger = require("morgan"),
  cookieParser = require("cookie-parser"),
  passport = require("passport"),
  session = require("express-session"),
  cors = require("cors"),
  helmet = require("helmet"),
  RateLimit = require("express-rate-limit"),
  fs = require("fs");


const morgan = require('morgan');
const defaultData = require("./middlewares/defaultData.js");

const handlersPath = "./services/socket_handlers",
  handlerFiles = fs.readdirSync(handlersPath);

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

const limiter = RateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 100, // Limite máximo de solicitações em 10 minutos
});

require("./database.js");
require("./auth/local")(passport);
require("./admin.js");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//app.use(helmet());
//app.use(limiter);
// Criando um stream de gravação para o arquivo de log
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

// Configurando o logger do morgan para gravar os logs no arquivo
app.use(morgan('combined', { stream: accessLogStream }));

app.use(logger("dev"));
app.use(cors());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "/public/")));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(
  session({
    secret: process.env.cookieSecret,
    resave: false,
    saveUninitialized: true,
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

app.use(function (req, res, next) {
  res.locals.currentPage = req.originalUrl.replace(/\//g, '');
  next();
});

app.use(defaultData);

process.on("unhandledRejection", (reason) => {
  throw reason;
});

require("./routes")(app);
require("./services/inverters");
require("./services/notifications");
require("./crons")

const server = app.listen(port, function () {
  console.log(`[CONNECTION INFO] Porta: ${server.address().port}`);
});

module.exports = app;
