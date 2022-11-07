const express = require("express"),
    router = express.Router(),
    { authenticationMiddlewareTrueFalse } = require("../auth/functions/middlewares"),
    { deleteItem, getAllItems } = require("../database/users");

router.get("/", async (req, res, next) => {
    if (authenticationMiddlewareTrueFalse(req, res, next)) {
        const customers = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/customers` })
        const data = {
            user: req.user,
            customers,
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

module.exports = router;