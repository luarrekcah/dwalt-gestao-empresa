const { authenticationMiddlewareTrueFalse } = require("../auth/functions/middlewares");
const { getAllItems, getUser } = require("../database/users");

const express = require("express"),
    router = express.Router();

router.get("/", async (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    const logs = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/logs` })
    user = await getUser({ userId: req.user.key })
    const data = {
        user,
        logs,
        message: null,
    }
    res.render("pages/logs", data);
});

module.exports = router;