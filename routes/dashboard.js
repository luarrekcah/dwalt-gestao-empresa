const express = require("express"),
    router = express.Router(),
    { set, getDatabase, ref, onValue } = require("@firebase/database");

const { authenticationMiddleware, authenticationMiddlewareTrueFalse } = require("../auth/functions/middlewares")


router.get("/", (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    const db = getDatabase();
    const projectsdb = ref(db, "gestaoempresa");
    onValue(projectsdb, async (snapshot) => {
        let projects, users;
        if(snapshot.val().projetos === null || snapshot.val().projetos === undefined) {
            projects = [];
        } else {
            projects = snapshot.val().projetos.filter(item => item.business === req.user._id);
        }
        if(snapshot.val().usuarios === null || snapshot.val().usuarios === undefined) {
            users = [];
        } else {
            users = snapshot.val().usuarios.filter(item => item.email_link === req.user._id);
        }
        const data = {
            user: req.user,
            projects,
            users,
        }; 
        res.render("pages/dashboard", data);
    });
});

router.get("/chamados", (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    const data = {
        user: req.user,
    };
    res.render("pages/staffs/calls", data);
});


router.get("/localizar/equipe", (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    const data = {
        user: req.user,
    };
    res.render("pages/staffs/track", data);
});


router.get("/reclamacoes", (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    const data = {
        user: req.user,
    };
    res.render("pages/customers/complaint", data);
});



module.exports = router;