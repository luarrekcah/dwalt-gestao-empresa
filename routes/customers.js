const express = require("express"),
    router = express.Router(),
    { set, getDatabase, ref, onValue } = require("@firebase/database");
    
const { authenticationMiddleware, authenticationMiddlewareTrueFalse } = require("../auth/functions/middlewares")

router.get("/", (req, res, next) => {
    if (authenticationMiddlewareTrueFalse(req, res, next)) {
        const db = getDatabase();
        const customersdb = ref(db, "gestaoempresa/usuarios");
        onValue(customersdb, async (snapshot) => {
            let customers;
            if(snapshot.val() === null || snapshot.val() === undefined) {
                customers = [];
            } else {
                customers = snapshot.val().filter(item => item.email_link === req.user._id);
            }
            const data = {
                user: req.user,
                customers,
            };
            res.render("pages/customers", data);
        });
    } else {
        res.redirect("/");
    }
});

module.exports = router;