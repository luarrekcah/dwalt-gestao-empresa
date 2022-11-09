const express = require("express"),
    router = express.Router(),
    moment = require("moment"),
    { getDate } = require("../auth/functions/database"),
    { authenticationMiddlewareTrueFalse } = require("../auth/functions/middlewares"),
    { createItem, deleteItem, getAllItems, getUser, updateItem } = require('../database/users');

router.get("/", async (req, res, next) => {
    if (authenticationMiddlewareTrueFalse(req, res, next)) {
        const user = await getUser({ userId: req.user.key });
        const projects = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/projects` });
        const staffs = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/staffs` });
        const teams = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/teams` });
        const data = {
            user,
            projects,
            staffs,
            teams,
            message: null,
        };
        res.render("pages/staffs", data);
    } else {
        res.redirect("/");
    }
});

router.post("/", async (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    const { type } = req.body;
    switch (type) {
        case "CREATE_TEAM":
            const name = req.body.teamName;
            const team = {
                name,
                createdAt: getDate(moment)
            }
            try {
                createItem({ path: `gestaoempresa/business/${req.user.key}/teams`, params: team })
            } catch (e) {
                console.log(e)
            }
            break;
        case "CREATE_MEMBER":
            const { email_link, nickname, role_name, teamId, teamName } = req.body;
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
            const allStaffs = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/staffs` });
            const findStaff = await allStaffs.find(staff => staff.data.email === email_link);
            if (findStaff !== undefined) {
                try {
                    createItem({ path: `gestaoempresa/business/${req.user.key}/teams/${teamId}/members`, params: member })
                    updateItem({
                        path: `gestaoempresa/business/${req.user.key}/staffs/${findStaff.key}`, params: {
                            team: {
                                id: teamId,
                                name: teamName,
                                role: role_name,
                                roles,
                                addedAt: getDate(moment),
                            }
                        }
                    });
                } catch (e) {
                    console.log(e)
                }
            } else {
                try {
                    createItem({ path: `gestaoempresa/business/${req.user.key}/teams/${teamId}/members`, params: member });
                    //CRIAR STAFF OU FZR O APP VERIFICAR SE ELE JA EXISTE EM ALGUMA TEAM E ATUALIZAR OS PROPRIOS DADOS
                } catch (e) {
                    console.log(e)
                }
            }
            break;
        case "DELETE_TEAM":
            const { id } = req.body;
            deleteItem({ path: `gestaoempresa/business/${req.user.key}/teams/${id}` })
            break;
        case "DELETE_MEMBER":
            const { email, teamMemberId } = req.body;
            const allMembers = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/teams/${teamMemberId}/members` });
            const staffId = allMembers.find(staff => staff.data.email === email).key;
            deleteItem({ path: `gestaoempresa/business/${req.user.key}/teams/${teamMemberId}/members/${staffId}` });
            break;
    }
    return res.redirect("/dashboard/gerenciar/equipe");
});


module.exports = router;