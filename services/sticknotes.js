const { getAllItems, createItem } = require("../database/users")
    , { getDate } = require("../auth/functions/database");

const config = {
    docs: { minimum: 6, docsName: [] },
    sleepCheck: 3,
}

const newNotes = async () => {
    const stickNotes = [];
    // @typemodel
    stickNotes.push({
        icon: "info", //warning
        style: "primary", //primary
        message: "Crie seu primeiro projeto!", //falta X
        url: "/dashboard/projetos", //url para aqlo
        read: false,
    });
    const business = await getAllItems({ path: `gestaoempresa/business/` });
    business.forEach(async b => {
        //--> do something with business data
        if (b.data.config !== undefined && b.data.config.sticknotes.active) { //will be need sticknotes.notifications (true/false)
            // get projects data
            const projects = await getAllItems({ path: `gestaoempresa/business/${b.key}/projects` });
            projects.forEach(async pj => {
                const docs = await getAllItems({ path: `gestaoempresa/business/${b.key}/projects/${pj.key}/documents` });
                console.log(`Docs length of business ${b.key} - at project ${pj.key} is ${docs.length}`)
                if (docs.length === 0) {
                    createItem({
                        path: `gestaoempresa/business/${b.key}/sticknotes`, params: {
                            icon: "triangle-exclamation", //warning
                            style: "warning", //primary
                            message: `O ${pj.data.apelidoProjeto} (projeto) está sem documentos, adicione um agora mesmo!`, //falta X
                            url: `/dashboard/projetos/visualizar/${pj.key}`, //url para aqlo
                            read: false,
                            createdAt: getDate()
                        }
                    });
                } else if (docs.length <= config.docs.minimum) {
                    createItem({
                        path: `gestaoempresa/business/${b.key}/sticknotes`, params: {
                            icon: "triangle-exclamation",
                            style: "warning",
                            message: `O ${pj.data.apelidoProjeto} (projeto) tem poucos documentos, adicione mais agora mesmo!`,
                            url: `/dashboard/projetos/visualizar/${pj.key}`,
                            read: false,
                            createdAt: getDate()
                        }
                    });
                }
                //verify all docs
                docs.forEach(d => {
                    console.log(d.data.documentName);
                });
            })
        } else {
            console.log(`Empresa ${b.data.info.documents.nome_fantasia} desativou os lembretes.`);
        }
    });
}

/*
setInterval(async () => {
    newNotes()
}, config.sleepCheck * 60 * 1000);
*/