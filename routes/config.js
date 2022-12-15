const { authenticationMiddlewareTrueFalse } = require("../auth/functions/middlewares");
const { getUser, updateItem, getItems } = require("../database/users");

const express = require("express"),
    router = express.Router();

router.get("/", async (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    const user = await getUser({ userId: req.user.key })
    const config = await getItems({ path: `gestaoempresa/business/${req.user.key}/config` });
    let message;
    if (req.query.message) {
        switch (req.query.message.toLowerCase()) {
            case 'updated':
                message = { type: 'success', title: 'Dados atualizados!', description: 'Já pode sair desta tela.' }
                break;
            case 'error':
                message = { type: 'error', title: 'Ocorreu um erro!', description: 'Verifique se temos permissão para acessar sua API ou se está com o funcionamento normal.' }
                break;
        }
    } else {
        message = null;
    }

    const data = {
        user,
        message,
        config,
    };
    res.render("pages/config", data);
});

router.post("/", async (req, res, next) => {
    const data = req.body;

    updateItem({
        path: `gestaoempresa/business/${req.user.key}/config/projectRules`, params: {
            needsBasicDocs: data.basicDocs !== 'on' ? false : true,
            needsBasicPhotos: data.basicPhotos !== 'on' ? false : true,
            onlyAdmEndProject: data.funADMendProject !== 'on' ? false : true,
            onlyAdmAcceptSurvey: data.fundADMacceptSurvey !== 'on' ? false : true,
            needsStatusReason: data.ProjectStatusReason !== 'on' ? false : true,
            StickNotes: data.sticknotes !== 'on' ? false : true,
            Alerts: data.notifications !== 'on' ? false : true,
        }
    });

    updateItem({
        path: `gestaoempresa/business/${req.user.key}/config/widgets`, params: {
            projectMaps: data.mapWidget !== 'on' ? false : true,
            growatt: data.growattWidgets !== 'on' ? false : true,
        }
    });

    updateItem({
        path: `gestaoempresa/business/${req.user.key}/config/login`, params: {
            hourSpecified: data.hourSpecified,
            loginAlert: data.loginAlert !== 'on' ? false : true,
        }
    });

    return res.redirect('/dashboard/configuracao?message=updated');
});

module.exports = router;