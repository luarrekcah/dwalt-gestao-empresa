const indexRouter = require("./routes/index"),
  payRouter = require("./routes/payment"),
  accountRouter = require("./routes/account"),
  logsRouter = require("./routes/logs"),
  dashboardRouter = require("./routes/dashboard"),
  projectsRouter = require("./routes/projects"),
  projoutsRouter = require("./routes/projoutsource"),
  staffsRouter = require("./routes/staffs"),
  configRouter = require("./routes/config"),
  customersRouter = require("./routes/customers"),
  surveysRouter = require("./routes/surveys"),
  notFoundRouter = require("./routes/notfound"),
  invertersRouter = require("./routes/inverters"),
  panelRouter = require("./routes/panel");

const webhookPayments = require("./routes/webhook/payments");

const api = require("./routes/api");
const { subscriptionChecker } = require("./utils");

const authenticationMiddleware = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
};
const authenticationSubsMiddleware = async (req, res, next) => {
  if(req.user === undefined || req.user.key === undefined) return res.redirect("/");
  try {
    const sub = await subscriptionChecker(req);
    console.log(sub);
    if(process.env.DEV) {
      return next();
    }
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
  app.use("/dlwalt", authenticationSubsMiddleware, panelRouter);
  app.use("/dashboard/projetos", authenticationSubsMiddleware, projectsRouter);
  app.use("/dashboard/projetos/terceirizar", authenticationSubsMiddleware, projoutsRouter);
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
