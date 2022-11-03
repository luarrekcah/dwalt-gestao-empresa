const express = require("express"),
    router = express.Router(),
    { set, getDatabase, ref, onValue } = require("@firebase/database");

const { authenticationMiddleware, authenticationMiddlewareTrueFalse } = require("../auth/functions/middlewares")

const db = getDatabase();
const database = ref(db, "gestaoempresa");

router.get("/", (req, res, next) => {
    if (authenticationMiddlewareTrueFalse(req, res, next)) {
        onValue(database, async (snapshot) => {
            let projects, staffs, teams;
            if (snapshot.val().projetos === null || snapshot.val().projetos === undefined) {
                projects = [];
            } else {
                projects = snapshot.val().projetos.filter(item => item.business === req.user._id);
            }
            if (snapshot.val().funcionarios === null || snapshot.val().funcionarios === undefined) {
                staffs = [];
            } else {
                staffs = snapshot.val().funcionarios.filter(item => item.email_link === req.user._id);
            }

            if (snapshot.val().equipes === null || snapshot.val().equipes === undefined) {
                teams = [];
            } else {
                teams = snapshot.val().equipes.filter(item => item.businessOwner === req.user._id);
            }
            const data = {
                user: req.user,
                projects,
                staffs,
                teams,
            };
            res.render("pages/staffs", data);
        });
    } else {
        res.redirect("/");
    }
});


router.post("/", (req, res, next) => {
    console.log(req.body);
});

module.exports = router;