const indexRouter = require("./routes/index"),
  registerRouter = require("./routes/register"),
  logoutRouter = require('./routes/logout'),
  forgotPassRouter = require('./routes/forgotPass'),
  resetPassRouter = require('./routes/resetPass'),
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
  panelRouter = require("./routes/panel"),
  proposalsRouter = require('./routes/proposals');

const indexLandingRouter = require("./routes/landing");

const webhookPayments = require("./routes/webhook/payments");

const api = require("./routes/api/routes");
const { subscriptionChecker } = require("./utils");

const authenticationMiddleware = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
};
const authenticationSubsMiddleware = async (req, res, next) => {
  if (req.user === undefined || req.user.key === undefined)
    return res.redirect("/login");
  try {
    const sub = await subscriptionChecker(req);
    console.log(sub);
    if (process.env.DEV) {
      return next();
    }
    if (req.isAuthenticated() && sub.code) return next();
    return res.redirect(sub.redirect);
  } catch (error) {
    console.error(error);
    return res.redirect("/login");
  }
};

module.exports = (app) => {
  //routes
  app.use("/", indexLandingRouter);
  app.use("/login", indexRouter);
  app.use("/logout", logoutRouter);
  app.use("/registro", registerRouter);
  app.use("/esqueciasenha", forgotPassRouter);
  app.use("/resetarsenha", resetPassRouter);
  app.use("/pagamento", authenticationMiddleware, payRouter);
  app.use("/conta", authenticationSubsMiddleware, accountRouter);
  app.use("/logs", authenticationSubsMiddleware, logsRouter);
  app.use("/dashboard", authenticationSubsMiddleware, dashboardRouter);
  app.use("/dlwalt", authenticationSubsMiddleware, panelRouter);
  app.use("/dashboard/projetos", authenticationSubsMiddleware, projectsRouter);
  app.use(
    "/dashboard/projetos/terceirizar",
    authenticationSubsMiddleware,
    projoutsRouter
  );
  app.use("/dashboard/equipe", authenticationSubsMiddleware, staffsRouter);
  app.use("/dashboard/clientes", authenticationSubsMiddleware, customersRouter);
  app.use(
    "/dashboard/configuracao",
    authenticationSubsMiddleware,
    configRouter
  );
  app.use("/dashboard/chamados", authenticationSubsMiddleware, surveysRouter);
  app.use(
    "/dashboard/inversores",
    authenticationSubsMiddleware,
    invertersRouter
  );

  app.use(
    "/dashboard/propostas",
    authenticationSubsMiddleware,
    proposalsRouter
  );

  //api
  app.use("/api/v1", api);

  //webhooks
  app.use("/webhook/payments", webhookPayments);

  //not found
  app.use("*", notFoundRouter);
};
