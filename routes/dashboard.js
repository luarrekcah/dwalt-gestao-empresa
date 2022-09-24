const express = require("express"),
    router = express.Router();
    
const { authenticationMiddleware, authenticationMiddlewareTrueFalse } = require("../auth/functions/middlewares")


router.get("/", (req, res, next) => {
    authenticationMiddleware(req, res, next);

    const data = {
        user: req.user,
    };
    console.log(req.user)
    res.render("pages/dashboard", data);
});

router.get("/chamados", (req, res, next) => {
    const data = {
        user: req.user,
    };
    if (authenticationMiddlewareTrueFalse(req, res, next)) {
        res.render("pages/staffs/calls", data);
    } else {
        res.redirect("/");
    }
});


router.get("/localizar/equipe", (req, res, next) => {
    const data = {
        user: req.user,
    };
    if (authenticationMiddlewareTrueFalse(req, res, next)) {
        res.render("pages/staffs/track", data);
    } else {
        res.redirect("/");
    }
});


router.get("/reclamacoes", (req, res, next) => {
    const data = {
        user: req.user,
    };
    if (authenticationMiddlewareTrueFalse(req, res, next)) {
        res.render("pages/customers/complaint", data);
    } else {
        res.redirect("/");
    }
});



module.exports = router;