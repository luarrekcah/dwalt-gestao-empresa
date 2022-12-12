const indexRouter = require("./routes/index"),
accountRouter = require("./routes/account"),
logsRouter = require("./routes/logs"),
dashboardRouter = require("./routes/dashboard"),
projectsRouter = require("./routes/projects"),
staffsRouter = require("./routes/staffs"),
customersRouter = require("./routes/customers");

const api = require("./routes/api");

module.exports = (app) => {
    //routes
    app.use("/", indexRouter);
    app.use("/conta", accountRouter);
    app.use("/logs", logsRouter);
    app.use("/dashboard", dashboardRouter);
    app.use("/dashboard/projetos", projectsRouter);
    app.use("/dashboard/gerenciar/equipe", staffsRouter);
    app.use("/dashboard/gerenciar/clientes", customersRouter);
    
    //api
    app.use("/api/v1", api);

    //not found
    //app.use("*", notFoundRouter);
};