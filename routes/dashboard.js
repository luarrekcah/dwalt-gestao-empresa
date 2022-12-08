const { getDate } = require("../auth/functions/database");

const express = require("express"),
    router = express.Router(),
    { authenticationMiddlewareTrueFalse } = require("../auth/functions/middlewares"),
    { getAllItems, updateItem, getUser, getItems } = require("../database/users"),
    moment = require("../services/moment");
admin = require('firebase-admin');

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
            case "error":
                message = { type: 'error', title: 'Ocorreu um erro!', description: 'Verifique se temos permissão para acessar sua API ou se está com o funcionamento normal.' }
                break;
                case "notifysend":
                message = { type: 'success', title: 'Notificação enviada!', description: 'Você sabia que, 95% das notificações podem ser entregues em 250ms?' }
                break;
        }
    } else {
        message = null;
    }

    let kwh = 0;

    if (growatt.plantList && growatt.plantList.data !== '') {
        growatt.plantList.data.plants.forEach(i => kwh = parseInt(i.total_energy) + kwh);
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
        kwh,
    };
    res.render("pages/dashboard", data);
});

router.post("/", async (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    console.log(req.body);
    switch (req.body.type.toLowerCase()) {
        case 'reload_growatt':
            const growattData = await getItems({ path: `gestaoempresa/business/${req.user.key}/growatt` });
            if (growattData === []) {
                await fetch("https://test.growatt.com/v1/plant/list", { headers: { token: req.body.token } })
                    .then((response) => response.json())
                    .then(response => {
                        const data = response.data
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
                const date = moment(growattData.token.lastUse);
                const duration = moment.duration(now.diff(date));
                if (duration.asHours() <= 2.5) {
                    return res.redirect('/dashboard?message=waitMore');
                } else {
                    await fetch("https://test.growatt.com/v1/plant/list", { headers: { token: req.body.token } })
                        .then((response) => response.json())
                        .then(response => {
                            const data = response.data;
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
            break;
        case 'send_notify':
            if (req.body.way === 'apps') {
                let tokens = [];
                const staffs = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/staffs` });
                const customers = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/customers` });
                if (req.body.to === 'staffs') {
                    staffs.forEach(i => {
                        if(i.data.token) {
                            tokens.push(i.data.token)
                        }
                    });
                } else if (req.body.to === 'customers') {
                    customers.forEach(i => {
                        if(i.data.token) {
                            tokens.push(i.data.token)
                        }
                    });
                } else {
                    customers.forEach(i => {
                        if(i.data.token) {
                            tokens.push(i.data.token)
                        }
                    });
                    staffs.forEach(i => {
                        if(i.data.token) {
                            tokens.push(i.data.token)
                        }
                    });
                }
                console.log(tokens);
                if (tokens === null) {
                    return res.redirect('/dashboard?message=error');
                } else {
                    await admin.messaging().sendMulticast({
                        tokens,
                        data: {
                            notifee: JSON.stringify({
                                title: req.body.notifyTitle,
                                body: req.body.notifyMessage,
                                android: {
                                    channelId: 'default',
                                  },
                            }),
                        },
                    });
                    return res.redirect('/dashboard?message=notifySend');
                }
            }
            break;
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