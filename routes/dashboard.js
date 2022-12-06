const { default: axios } = require("axios");
const { getDate } = require("../auth/functions/database");

const express = require("express"),
    router = express.Router(),
    { authenticationMiddlewareTrueFalse } = require("../auth/functions/middlewares"),
    { getAllItems, updateItem, getUser, getItems } = require("../database/users"),
    moment = require("../services/moment");

router.get("/", async (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    const projects = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/projects` }),
        customers = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/customers` }),
        surveys = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/surveys` }),
        complaints = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/complaints` }),
        staffs = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/staffs` }),
        growatt = await getItems({ path: `gestaoempresa/business/${req.user.key}/growatt` }),
        user = await getUser({ userId: req.user.key })

    let message;

    if (req.query.message) {
        switch (req.query.message.toLowerCase()) {
            case "waitmore":
                message = { type: 'warning', title: 'Opa! A api da growatt tem limite de requisição.', description: 'Tente novamente daqui algumas horas, o tempo entre as requisições deve ser de 2.5 horas.' }
                break;
        }
    } else {
        message = null;
    }

    const data = {
        user,
        projects,
        customers,
        surveys,
        complaints,
        staffs,
        growatt,
        message,
    };

    console.log(growatt);
    res.render("pages/dashboard", data);
});

router.post("/", async (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    const growattData = await getItems({ path: `gestaoempresa/business/${req.user.key}/growatt/token` });
    if (growattData === []) {
        axios.get("https://test.growatt.com/v1/plant/user_plant_list", { headers: { token: req.body.token } })
            .then(response => {
                const data = response.data.data;
                updateItem({
                    path: `gestaoempresa/business/${req.user.key}/growatt/plantList`, params: { data }
                });
                updateItem({
                    path: `gestaoempresa/business/${req.user.key}/growatt/token`, params: {
                        lastUse: getDate(),
                        requestByDay: 10,
                    }
                });
                return res.redirect('/dashboard');
            });
    } else {
        const now = moment(new Date());
        const date = moment(growattData.lastUse);
        const hours = date.diff(now, 'hours');
        console.log(hours);
        if (hours <= 2) {
            return res.redirect('/dashboard?message=waitMore');
        } else {
            axios.get("https://test.growatt.com/v1/plant/user_plant_list", { headers: { token: req.body.token } })
                .then(response => {
                    const data = response.data.data;
                    updateItem({
                        path: `gestaoempresa/business/${req.user.key}/growatt/plantList`, params: { data }
                    });
                    updateItem({
                        path: `gestaoempresa/business/${req.user.key}/growatt/token`, params: {
                            lastUse: getDate(),
                            requestByDay: 10,
                        }
                    });
                    return res.redirect('/dashboard');
                });
        }
    }

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