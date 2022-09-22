const indexRouter = require("./routes/index");

module.exports = (app) => {
    app.use("/", indexRouter);
    //app.use("*", notFoundRouter);
};