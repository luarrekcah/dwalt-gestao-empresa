const asaasAPI = require("node-asaas-api");

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
const { getUser } = require("./database/users");

let params = {
  environment: asaasAPI.PRODUCTION,
  apiKey: process.env.asaasApiKey,
  version: "v3",
};

asaasAPI.config(params);

const authenticationMiddleware = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
};

const subscriptionCheckerMiddleware = async (req, res, next) => {
  if (!req.isAuthenticated()) return res.redirect("/pagamento");
  const user = await getUser({ userId: req.user.key });
  if (user.subscriptionID === "" || user.subscriptionID === undefined) return res.redirect("/pagamento");
  asaasAPI.subscriptions.get(user.subscriptionID).then((response) => {
    console.log("Obtem uma assinatura");
    console.log(response.data);
    return next();
  });
};

module.exports = (app) => {
  //routes
  app.use("/", indexRouter);
  app.use("/pagamento", authenticationMiddleware, payRouter);
  app.use("/conta", subscriptionCheckerMiddleware, accountRouter);
  app.use("/logs", subscriptionCheckerMiddleware, logsRouter);
  app.use("/dashboard", subscriptionCheckerMiddleware, dashboardRouter);
  app.use("/dashboard/projetos", subscriptionCheckerMiddleware, projectsRouter);
  app.use("/dashboard/equipe", subscriptionCheckerMiddleware, staffsRouter);
  app.use(
    "/dashboard/clientes",
    subscriptionCheckerMiddleware,
    customersRouter
  );
  app.use(
    "/dashboard/configuracao",
    subscriptionCheckerMiddleware,
    configRouter
  );

  //api
  app.use("/api/v1", api);

  //webhooks
  app.use("/webhook/payments", webhookPayments);

  //not found
  //app.use("*", notFoundRouter);
};
