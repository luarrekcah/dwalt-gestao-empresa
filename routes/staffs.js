const express = require("express"),
    router = express.Router(),
    moment = require("moment"),
    { getDate } = require("../auth/functions/database"),
    { authenticationMiddlewareTrueFalse } = require("../auth/functions/middlewares"),
    { createItem, deleteItem, getAllItems } = require('../database/users');

router.get("/", async (req, res, next) => {
    if (authenticationMiddlewareTrueFalse(req, res, next)) {
        const projects = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/projects` }),
            staffs = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/staffs` }),
            teams = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/teams` })
        const data = {
            user: req.user,
            projects,
            staffs,
            teams,
        };
        res.render("pages/staffs", data);
    } else {
        res.redirect("/");
    }
});

router.post("/", (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    const { type } = req.body;
    switch (type) {
        case "CREATE_TEAM":
            const { teamName } = req.body;
            const team = {
                name: teamName,
                createdAt: getDate(moment)
            }
            createItem({ path: `gestaoempresa/business/${req.user.key}/teams`, params: team })
            break;
        case "CREATE_MEMBER":
            const { email_link, nickname, role_name, teamId } = req.body;
            let roles = [];
            if (req.body.ADMIN)
                roles.push("ADMIN");
            if (req.body.GEN_PROJECT_PHOTOS)
                roles.push("GEN_PROJECT_PHOTOS");
            if (req.body.GEN_SURVEYS)
                roles.push("GEN_SURVEYS");
            const member = {
                email: email_link,
                nickname,
                role_name,
                roles,
            };
            createItem({ path: `gestaoempresa/business/${req.user.key}/teams/${teamId}/members`, params: member })
            break;
        case "DELETE_TEAM":
            const { id } = req.body;
            deleteItem({ path: `gestaoempresa/business/${req.user.key}/teams/${id}` })
            break;
    }
    return res.redirect("/dashboard/gerenciar/equipe");
});

module.exports = router;