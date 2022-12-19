const indexRouter = require("./routes/index"),
accountRouter = require("./routes/account"),
logsRouter = require("./routes/logs"),
dashboardRouter = require("./routes/dashboard"),
projectsRouter = require("./routes/projects"),
staffsRouter = require("./routes/staffs"),
configRouter = require("./routes/config"),
customersRouter = require("./routes/customers");

const api = require("./routes/api");

module.exports = (app) => {
    //routes
    app.use("/", indexRouter);
    app.use("/conta", accountRouter);
    app.use("/logs", logsRouter);
    app.use("/dashboard", dashboardRouter);
    app.use("/dashboard/projetos", projectsRouter);
    app.use("/dashboard/equipe", staffsRouter);
    app.use("/dashboard/clientes", customersRouter);
    app.use("/dashboard/configuracao", configRouter);
    
    //api
    app.use("/api/v1", api);

    //not found
    //app.use("*", notFoundRouter);
};