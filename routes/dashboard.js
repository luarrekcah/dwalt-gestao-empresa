const express = require("express"),
    router = express.Router(),
    { set, getDatabase, ref, onValue } = require("@firebase/database");

const { authenticationMiddleware, authenticationMiddlewareTrueFalse } = require("../auth/functions/middlewares")

router.get("/", (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    const db = getDatabase();
    const projectsdb = ref(db, "gestaoempresa");
    onValue(projectsdb, async (snapshot) => {
        let projects, users, survey, complaint;
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
        if(snapshot.val().survey === null || snapshot.val().survey === undefined) {
            survey = [];
        } else {
            survey = snapshot.val().survey.filter(item => item.ids.businessId === req.user._id);
        }
        if(snapshot.val().complaint === null || snapshot.val().complaint === undefined) {
            complaint = [];
        } else {
            complaint = snapshot.val().complaint.filter(item => item.ids.businessId === req.user._id);
        }
        const data = {
            user: req.user,
            projects,
            users,
            survey,
            complaint,
        }; 
        res.render("pages/dashboard", data);
    }, {
        onlyOnce: true
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
    const db = getDatabase();
    const projectsdb = ref(db, "gestaoempresa");
    onValue(projectsdb, async (snapshot) => {
        let complaint;
        if(snapshot.val().complaint === null || snapshot.val().complaint === undefined) {
            complaint = [];
        } else {
            complaint = snapshot.val().complaint.filter(item => item.ids.businessId === req.user._id);
        }
        const data = {
            user: req.user,
            complaint,
        };
        res.render("pages/customers/complaint", data);
    })
});



module.exports = router;