const { getAllItems, createItem, updateItem } = require("../database/users"),
  { getDate } = require("../auth/functions/database");

const config = {
  docs: { minimum: 6, docsName: [] },
  sleepCheck: 3,
};

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
  business.forEach(async (b) => {
    //--> do something with business data
    if (
      b.data.config &&
      b.data.config.projectRules &&
      b.data.config.projectRules.StickNotes
    ) {
      //will be need sticknotes.notifications (true/false)
      const now = moment(new Date());
      let date = moment("01-01-2000", "DD-MM-YYYY")
      if(b.data.config.sticknotes) {
        date = moment(b.data.config.sticknotes.lastUse);
      }
      const duration = moment.duration(now.diff(date));
      if (duration.asHours() >= 24) { //6 hours
        // get projects data
        const projects = await getAllItems({
          path: `gestaoempresa/business/${b.key}/projects`,
        });
        projects.forEach(async (pj) => {
          const docs = await getAllItems({
            path: `gestaoempresa/business/${b.key}/projects/${pj.key}/documents`,
          });
          //console.log(`Docs length of business ${b.key} - at project ${pj.key} is ${docs.length}`)
          if (docs.length === 0) {
            createItem({
              path: `gestaoempresa/business/${b.key}/sticknotes`,
              params: {
                icon: "triangle-exclamation", //warning
                style: "warning", //primary
                message: `O ${pj.data.apelidoProjeto} (projeto) está sem documentos, adicione um agora mesmo!`, //falta X
                url: `/dashboard/projetos/visualizar/${pj.key}`, //url para aqlo
                read: false,
                createdAt: getDate(),
              },
            });
          } else if (docs.length <= config.docs.minimum) {
            createItem({
              path: `gestaoempresa/business/${b.key}/sticknotes`,
              params: {
                icon: "triangle-exclamation",
                style: "warning",
                message: `O ${pj.data.apelidoProjeto} (projeto) tem poucos documentos, adicione mais agora mesmo!`,
                url: `/dashboard/projetos/visualizar/${pj.key}`,
                read: false,
                createdAt: getDate(),
              },
            });
          }
          updateItem({
            path: `gestaoempresa/business/${b.key}/config/sticknotes`,
            params: {
              lastUse: getDate(),
            },
          });
          //verify all docs
          /* docs.forEach(d => {
                    console.log(d.data.documentName);
                });*/
        });
      } 
    } else {
      console.log(
        `Empresa ${b.data.info.documents.nome_fantasia} desativou os lembretes.`
      );
    }
  });
};

setInterval(async () => {
  newNotes();
}, 1 * 60 * 1000);
