const express = require("express"),
    router = express.Router(),
    { authenticationMiddlewareTrueFalse } = require("../auth/functions/middlewares"),
    { getAllItems, updateItem } = require("../database/users");

router.get("/", async (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    const projects = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/projects` }),
        users = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/users` }),
        surveys = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/surveys` }),
        complaints = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/complaints` }),
        staffs = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/staffs` })
        console.log("STAFFS:\n\n", staffs);
    const data = {
        user: req.user,
        projects,
        users,
        surveys,
        complaints,
        staffs,
    };
    res.render("pages/dashboard", data);
});

router.get("/chamados", async (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    const surveys = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/surveys` })
    const data = {
        user: req.user,
        surveys,
    };
    res.render("pages/staffs/calls", data);
});

router.post("/chamados", (req, res, next) => {
    switch (req.query.type) {
        case 'concludeCall':
            updateItem({
                path: `gestaoempresa/business/${req.user.key}/surveys/${req.query.id}`, params: {
                    finished: true,
                    status: 'Solicitação finalizada'
                }
            })
            res.redirect('/dashboard/chamados');
            break;
        case 'acceptCall':
            updateItem({
                path: `gestaoempresa/business/${req.user.key}/surveys/${req.query.id}`, params: {
                    accepted: true,
                    status: 'Empresa aceitou o chamado'
                }
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

router.get("/reclamacoes", async (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    const complaints = await getAllItems({path: `gestaoempresa/business/${req.user.key}/complaints/`});
    const data = {
        user: req.user,
        complaints,
    };
    res.render("pages/customers/complaint", data);
});


module.exports = router;