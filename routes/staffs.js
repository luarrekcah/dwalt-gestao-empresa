const express = require("express"),
    router = express.Router(),
    moment = require("moment"),
    { set, getDatabase, ref, onValue } = require("@firebase/database");

const { makeId, getDate } = require("../auth/functions/database");
const { authenticationMiddleware, authenticationMiddlewareTrueFalse } = require("../auth/functions/middlewares")

const { create } = require('../database/users');

router.get("/", (req, res, next) => {
    if (authenticationMiddlewareTrueFalse(req, res, next)) {
        const db = getDatabase();
        const database = ref(db, "gestaoempresa");
        onValue(database, async (snapshot) => {
            let projects, staffs, teams;
            if (snapshot.val().projetos === null || snapshot.val().projetos === undefined) {
                projects = [];
            } else {
                projects = snapshot.val().projetos.filter(item => item.business === req.user._id);
            }
            if (snapshot.val().funcionarios === null || snapshot.val().funcionarios === undefined) {
                staffs = [];
            } else {
                staffs = snapshot.val().funcionarios.filter(item => item.email_link === req.user._id);
            }
            if (snapshot.val().equipes === null || snapshot.val().equipes === undefined) {
                teams = [];
            } else {
                teams = snapshot.val().equipes.filter(item => item.ownerId === req.user._id);
            }
            const data = {
                user: req.user,
                projects,
                staffs,
                teams,
            };
            console.log(data.teams);
            res.render("pages/staffs", data);
        });
    } else {
        res.redirect("/");
    }
});

router.post("/", (req, res, next) => {
    if (!authenticationMiddlewareTrueFalse(req, res, next)) return res.redirect("/");
    const db = getDatabase();
    const teamsDb = ref(db, "gestaoempresa/equipes");
    onValue(teamsDb, (snapshot) => {
        const { type } = req.body;
        switch (type) {
            case "CREATE_TEAM":
                let allTeams;
                const { teamName, ownerId } = req.body;
                const team = {
                    //id: makeId(),
                    name: teamName,
                    ownerId,
                    membersId: [],
                    createdAt: getDate(moment)
                }

                create('gestaoempresa/teams', team)
               /* if (snapshot.val() === null) {
                    allTeams = [];
                } else {
                    allTeams = snapshot.val();
                };
                allTeams.push(team)
                set(ref(db, "gestaoempresa/equipes"), allTeams);*/
                //return res.redirect("/dashboard/gerenciar/equipe");
                break;
            case "CREATE_MEMBER":
                //CREATE
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
                /*
                const { email_link, nickname, role_name, teamId } = req.body;
                const allTeamss = snapshot.val();
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
                console.log(member);
                const newTeamss = allTeamss.map(item => {
                    if (item.id === teamId) {
                        const members = item.members === undefined ? [] : item.members;
                        members.push(member);
                        item.members = members;
                        return item;
                    }
                    return item;
                })
                set(ref(db, "gestaoempresa/equipes"), newTeamss);*/
                //return res.redirect("/dashboard/gerenciar/equipe");

                create({path: 'gestaoempresa/staffs', params: member});

                break;
            case "DELETE_TEAM":
                const { id } = req.body;
                const teams = snapshot.val()
                const newTeams = teams.filter(team => team.id !== id)
                set(ref(db, "gestaoempresa/equipes"), newTeams);
                //return res.redirect("/dashboard/gerenciar/equipe");
                break;
            case "DELETE_MEMBER":
                //DELETE
                break;
        }
        return res.redirect(200, "/dashboard/gerenciar/equipe");
    }, {
        onlyOnce: true
    });
});

module.exports = router;