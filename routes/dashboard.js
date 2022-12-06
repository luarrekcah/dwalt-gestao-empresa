const { default: axios } = require("axios");
const { getDate } = require("../auth/functions/database");

const express = require("express"),
    router = express.Router(),
    { authenticationMiddlewareTrueFalse } = require("../auth/functions/middlewares"),
    { getAllItems, updateItem, getUser } = require("../database/users");

router.get("/", async (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    const projects = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/projects` }),
        customers = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/customers` }),
        surveys = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/surveys` }),
        complaints = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/complaints` }),
        staffs = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/staffs` }),
        user = await getUser({ userId: req.user.key })
    const data = {
        user,
        projects,
        customers,
        surveys,
        complaints,
        staffs,
        message: null,
    };
    res.render("pages/dashboard", data);
});

router.post("/", async (req, res, next) => {
    axios.get("https://test.growatt.com/v1/plant/user_plant_list", {headers: {token: req.body.token}})
    .then(response => {
        const data = response.data.data;
        updateItem({
            path: `gestaoempresa/business/${req.user.key}/growatt/plantList`, params: {data}
        });
        updateItem({
            path: `gestaoempresa/business/${req.user.key}/growatt/token`, params: {
                lastUse: getDate(),
                requestByDay: 10,
            }
        });
        return res.redirect('/dashboard');
    });
});

router.get("/chamados", async (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    const surveys = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/surveys` })
    const user = await getUser({ userId: req.user.key });
    const data = {
        user,
        surveys,
        message: null
    };
    res.render("pages/staffs/calls", data);
});

router.post("/chamados", (req, res, next) => {
    console.log(req.body);
    switch (req.body.type) {
        case 'concludeCall':
            updateItem({
                path: `gestaoempresa/business/${req.user.key}/surveys/${req.body.surveyId}`, params: {
                    finished: true,
                    status: 'Solicitação finalizada'
                }
            })
            break;
    }

    return res.redirect('/dashboard/chamados');
});

router.get("/localizar/equipe", async (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    const teams = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/teams` }),
        user = await getUser({ userId: req.user.key })
    const data = {
        user,
        teams,
        message: null,
    };
    res.render("pages/staffs/track", data);
});

router.get("/reclamacoes", async (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    const complaints = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/complaints/` });
    const user = await getUser({ userId: req.user.key })
    const data = {
        user,
        complaints,
        message: null,
    };
    res.render("pages/customers/complaint", data);
});


module.exports = router;