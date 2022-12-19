const express = require("express"),
    router = express.Router(),
    { authenticationMiddlewareTrueFalse } = require("../auth/functions/middlewares"),
    { deleteItem, getAllItems, getUser } = require("../database/users");

router.get("/", async (req, res, next) => {
    if (authenticationMiddlewareTrueFalse(req, res, next)) {
        const customers = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/customers` })
        const user = await getUser({userId: req.user.key})
        const data = {
            user,
            customers,
            message: null,
        };
        res.render("pages/customers", data);
    } else {
        res.redirect("/");
    }
});

router.delete("/", (req, res, next) => {
    const id = req.body.id;
    deleteItem({ path: `gestaoempresa/business/${req.user.key}/customers/${id}` })
    res.sendStatus(200);
});

router.get("/adicionar", async (req, res, next) => {
    if (authenticationMiddlewareTrueFalse(req, res, next)) {
        const user = await getUser({userId: req.user.key})
        const data = {
            user,
            message: null,
        };
        res.render("pages/customers/new", data);
    } else {
        res.redirect("/");
    }
});

module.exports = router;