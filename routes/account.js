const express = require("express"),
    router = express.Router();
    
const { authenticationMiddleware, authenticationMiddlewareTrueFalse } = require("../auth/functions/middlewares")

router.get("/", (req, res, next) => {
    const data = {
        user: req.user,
    };
    if (authenticationMiddlewareTrueFalse(req, res, next)) {
        res.render("pages/profile", data);
    } else {
        res.redirect("/");
    }
});

module.exports = router;