const express = require("express"),
    router = express.Router(),
    moment = require("moment"),
    { getDate } = require("../auth/functions/database"),
    { createItem, deleteItem, getAllItems, getUser, updateItem, getItems } = require('../database/users');

router.get("/", async (req, res, next) => {
        const user = await getUser({ userId: req.user.key });
        const projects = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/projects` });
        const staffs = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/staffs` });
        const teams = await getAllItems({ path: `gestaoempresa/business/${req.user.key}/teams` });
        const  notifications = await getAllItems({
            path: `gestaoempresa/business/${req.user.key}/notifications`,
          })
        const data = {
            user,
            projects,
            staffs,
            teams,
            message: null,
            currentPage: res.locals.currentPage,
            notifications
        };
        res.render("pages/staffs", data);

});

router.post("/", async (req, res, next) => {
    
    const { type } = req.body;
    switch (type) {
        case "CREATE_TEAM":
            const name = req.body.teamName;
            const team = {
                name,
                createdAt: getDate()
            }
            const teamsAll = await getAllItems({path: `gestaoempresa/business/${req.user.key}/teams`});

            const founded = teamsAll.find(i => i.data.name === name);

            if(founded !== undefined) break;

            try {
                createItem({ path: `gestaoempresa/business/${req.user.key}/teams`, params: team });

                
                /* 

                -----RECLAMACOES-----
                
                createItem({
                    path: `gestaoempresa/business/${req.user.key}/complaints`, params: {
                        projectId: "-NGTx9FoC3_Za5evJdNi",
                        title: "Mal atendido"
                        text: "bla bla bla"
                        publishedAt: getDate(),
                    }
                });


                -----CHAMADOS-----
 
                createItem({
                     path: `gestaoempresa/business/${req.user.key}/surveys`, params: {
                         projectId: "-NGTx9FoC3_Za5evJdNi",
                         title: 'Sistema não liga',
                         text: 'Entao, eu dei olhada, acho que está com algum problema na fiação porque parou de funcinar e ta quente os fios.',
                         createdAt: getDate(),
                         finished: false,
                         accepted: false,
                         status: 'Aguardando resposta da empresa...',
                         team: {
                             teamId: '',
                             timestamp: '',
                             coords: ''
                         }
                     }
                 })*/
            } catch (e) {
                console.log(e)
            }
            break;
        case "CREATE_MEMBER":
            const { email_link, nickname, role_name, teamId, teamNameStaff } = req.body;
            console.log(req.body);
            if (teamId === '' || teamNameStaff === '') break;
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
                                name: teamNameStaff,
                                role: role_name,
                                roles,
                                addedAt: getDate(),
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
    return res.redirect("/dashboard/equipe");
});


module.exports = router;