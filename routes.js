const indexRouter = require("./routes/index"),
accountRouter = require("./routes/account")

module.exports = (app) => {
    app.use("/", indexRouter);
    app.use("/conta", accountRouter);
    //app.use("*", notFoundRouter);
};