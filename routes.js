const indexRouter = require("./routes/index"),
  payRouter = require("./routes/payment"),
  accountRouter = require("./routes/account"),
  logsRouter = require("./routes/logs"),
  dashboardRouter = require("./routes/dashboard"),
  projectsRouter = require("./routes/projects"),
  staffsRouter = require("./routes/staffs"),
  configRouter = require("./routes/config"),
  customersRouter = require("./routes/customers"),
  surveysRouter = require("./routes/surveys"),
  notFoundRouter = require("./routes/notfound"),
  invertersRouter = require("./routes/inverters");

const webhookPayments = require("./routes/webhook/payments");

const api = require("./routes/api");
const { subscriptionChecker } = require("./utils");

const authenticationMiddleware = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
};
const authenticationSubsMiddleware = async (req, res, next) => {
  try {
    const sub = await subscriptionChecker(req);
    console.log(sub);
    if (req.isAuthenticated() && sub.code) return next();
    return res.redirect(sub.redirect);
  } catch (error) {
    console.error(error);
    return res.redirect("/");
  }
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
  app.use("/dashboard/chamados", authenticationSubsMiddleware, surveysRouter);
  app.use("/dashboard/inversores", authenticationSubsMiddleware, invertersRouter);
  
  //api
  app.use("/api/v1", api);

  //webhooks
  app.use("/webhook/payments", webhookPayments);

  //not found
  app.use("*", notFoundRouter);
};
