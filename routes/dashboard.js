const express = require("express"),
    router = express.Router(),
    { set, update, getDatabase, ref, onValue } = require("@firebase/database");

const { authenticationMiddleware, authenticationMiddlewareTrueFalse } = require("../auth/functions/middlewares")

const db = getDatabase();
const database = ref(db, "gestaoempresa");

router.get("/", (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    onValue(database, async (snapshot) => {
        let projects, users, survey, complaint;
        if (snapshot.val().projetos === null || snapshot.val().projetos === undefined) {
            projects = [];
        } else {
            projects = snapshot.val().projetos.filter(item => item.business === req.user._id);
        }
        if (snapshot.val().usuarios === null || snapshot.val().usuarios === undefined) {
            users = [];
        } else {
            users = snapshot.val().usuarios.filter(item => item.email_link === req.user._id);
        }
        if (snapshot.val().survey === null || snapshot.val().survey === undefined) {
            survey = [];
        } else {
            survey = snapshot.val().survey.filter(item => item.ids.businessId === req.user._id);
        }
        if (snapshot.val().complaint === null || snapshot.val().complaint === undefined) {
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
    onValue(database, async (snapshot) => {
        let survey;

        if (snapshot.val().survey === null || snapshot.val().survey === undefined) {
            survey = [];
        } else {
            survey = snapshot.val().survey.filter(item => item.ids.businessId === req.user._id);
        }

        const data = {
            user: req.user,
            survey,
        };
        res.render("pages/staffs/calls", data);

    })

});

router.post("/chamados", (req, res, next) => {
    console.log(req.query);
    switch (req.query.type) {
        case 'concludeCall':
            onValue(database, async (snapshot) => {
                const update = snapshot.val().survey.map(i => {
                    if (i.ids.projectId === req.query.id) {
                        i.finished = true
                        i.status = 'Solicitação finalizada'
                        return i;
                    }
                    return i;
                })
                set(ref(db, "gestaoempresa/survey"), update);
            })
            res.redirect('/dashboard/chamados');
            break;
        case 'acceptCall':
            onValue(database, async (snapshot) => {
                const update = snapshot.val().survey.map(i => {
                    if (i.ids.projectId === req.query.id) {
                        i.accepted = true
                        i.status = 'Empresa aceitou o chamado...'
                        return i;
                    }
                    return i;
                })
                set(ref(db, "gestaoempresa/survey"), update);
            })
            res.redirect('/dashboard/chamados');
            break;
    }
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
    onValue(database, async (snapshot) => {
        let complaint;
        if (snapshot.val().complaint === null || snapshot.val().complaint === undefined) {
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