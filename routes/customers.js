const express = require("express"),
    router = express.Router(),
    { set, getDatabase, ref, onValue } = require("@firebase/database");

const { authenticationMiddleware, authenticationMiddlewareTrueFalse } = require("../auth/functions/middlewares")

const db = getDatabase();
const users = ref(db, "gestaoempresa/usuarios");

router.get("/", (req, res, next) => {
    if (authenticationMiddlewareTrueFalse(req, res, next)) {
        
        onValue(users, async (snapshot) => {
            let customers;
            if (snapshot.val() === null || snapshot.val() === undefined) {
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

router.delete("/", (req, res, next) => {
    const id = req.body.id
    onValue(users, async (snapshot) => {
        let customers;
        if (snapshot.val() === null || snapshot.val() === undefined) {
            customers = [];
            res.sendStatus(200);
        } else {
            customers = snapshot.val();
            const newUsers = customers.map(item => {
                if (item._id === id) {
                    item.email_link = '';
                    return item;
                }
                return item;
            });
            set(ref(db, "gestaoempresa/usuarios"), newUsers);
            res.sendStatus(200);
        }
    },
        {
            onlyOnce: true
        }
    );
});

module.exports = router;