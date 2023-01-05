const indexRouter = require("./routes/index"),
payRouter = require("./routes/payment"),
accountRouter = require("./routes/account"),
logsRouter = require("./routes/logs"),
dashboardRouter = require("./routes/dashboard"),
projectsRouter = require("./routes/projects"),
staffsRouter = require("./routes/staffs"),
configRouter = require("./routes/config"),
customersRouter = require("./routes/customers");

const api = require("./routes/api");

const authenticationMiddleware = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect("/");
  };

module.exports = (app) => {
    //routes
    app.use("/", indexRouter);
    app.use("/pagamento", payRouter);
    app.use("/conta", authenticationMiddleware, accountRouter);
    app.use("/logs", authenticationMiddleware, logsRouter);
    app.use("/dashboard",  authenticationMiddleware, dashboardRouter);
    app.use("/dashboard/projetos",  authenticationMiddleware, projectsRouter);
    app.use("/dashboard/equipe",  authenticationMiddleware, staffsRouter);
    app.use("/dashboard/clientes",  authenticationMiddleware, customersRouter);
    app.use("/dashboard/configuracao",  authenticationMiddleware, configRouter);
    
    //api
    app.use("/api/v1", api);

    //not found
    //app.use("*", notFoundRouter);
};