const indexRouter = require("./routes/index"),
  payRouter = require("./routes/payment"),
  accountRouter = require("./routes/account"),
  logsRouter = require("./routes/logs"),
  dashboardRouter = require("./routes/dashboard"),
  projectsRouter = require("./routes/projects"),
  staffsRouter = require("./routes/staffs"),
  configRouter = require("./routes/config"),
  customersRouter = require("./routes/customers");

const webhookPayments = require("./routes/webhook/payments");

const api = require("./routes/api");
const { subscriptionChecker } = require("./utils");

const authenticationMiddleware = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
};

const authenticationSubsMiddleware = async (req, res, next) => {
  if (req.isAuthenticated() && await subscriptionChecker(req)) return next();
  res.redirect("pagamento/erro?message=subscription_error");
};

module.exports = (app) => {
  //routes
  app.use("/", indexRouter);
  app.use("/pagamento", authenticationMiddleware, payRouter);
  app.use("/conta", authenticationSubsMiddleware, accountRouter);
  app.use("/logs", authenticationSubsMiddleware, logsRouter);
  app.use("/dashboard", authenticationSubsMiddleware, dashboardRouter);
  app.use("/dashboard/projetos", authenticationSubsMiddleware, projectsRouter);
  app.use("/dashboard/equipe", authenticationSubsMiddleware, staffsRouter);
  app.use("/dashboard/clientes", authenticationSubsMiddleware, customersRouter);
  app.use("/dashboard/configuracao", authenticationSubsMiddleware, configRouter);

  //api
  app.use("/api/v1", api);

  //webhooks
  app.use("/webhook/payments", webhookPayments);

  //not found
  //app.use("*", notFoundRouter);
};
