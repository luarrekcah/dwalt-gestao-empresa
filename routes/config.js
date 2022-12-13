const { authenticationMiddlewareTrueFalse } = require("../auth/functions/middlewares");
const { getUser } = require("../database/users");

const express = require("express"),
    router = express.Router();

router.get("/", async (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    const user = await getUser({ userId: req.user.key })
    const data = {
        user,
        message: null,
    };
    res.render("pages/config", data);
});

router.post("/config", async (req, res, next) => {
    console.log(req.body);
});

module.exports = router;