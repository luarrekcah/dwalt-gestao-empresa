const {
  getStorage,
  uploadString,
  getDownloadURL,
  ref,
} = require("@firebase/storage");
const { getDate } = require("../auth/functions/database");
const {
  getAllItems,
  getUser,
  updateItem,
  createLogs,
  createItem,
  getItems,
} = require("../database/users");

const express = require("express"),
  router = express.Router();

router.get("/", async (req, res, next) => {
  const surveys = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/surveys`,
  });
  const projects = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/projects`,
  });
  const notifications = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/notifications`,
  });
  const user = await getUser({ userId: req.user.key });


  console.log(surveys[600].project)

  let message;

  if (req.query.message) {
    switch (req.query.message.toLowerCase()) {
      case "ok":
        message = {
          type: "success",
          title: "Tudo certo!",
          description: "Clique em OK para continuar.",
        };
        break;
      case "callCreated":
        message = {
          type: "success",
          title: "Chamado criado!",
          description: "Clique em OK para continuar.",
        };
        break;
      case "erro":
        message = {
          type: "error",
          title: "Ocorreu um erro!",
          description:
            "Tente novamente mais tarde, se o problema persistir, copie o URL dessa página e informe ao suporte.",
        };
        break;
      case "callEnded":
        message = {
          type: "success",
          title: "Chamado finalizado.",
          description: "Clique em OK para continuar.",
        };
        break;
    }
  } else {
    message = null;
  }

  const data = {
    user,
    surveys,
    projects,
    message,
    currentPage: res.locals.currentPage,
    notifications,
  };
  res.render("pages/staffs/calls", data);
});

router.post("/", async (req, res, next) => {
  console.log(req.body);
  const storage = getStorage();
  const data = req.body;

  const cID = await getItems({
    path: `gestaoempresa/business/${req.user.key}/projects/${data.projectID}/customerID`,
  });
  const projectData = await getItems({
    path: `gestaoempresa/business/${req.user.key}/projects/${data.projectID}`,
  });
  const customerData = await getItems({
    path: `gestaoempresa/business/${req.user.key}/customers/${cID}`,
  });

  console.log(customerData);

  switch (data.type) {
    case "concludeCall":
      try {
        updateItem({
          path: `gestaoempresa/business/${req.user.key}/surveys/${data.surveyId}`,
          params: {
            finished: true,
            status: "Solicitação finalizada",
          },
        });
        createLogs(req.user.key, "Chamado finalizado");
        res.redirect("/dashboard/chamados?message=callEnded");
      } catch (error) {
        res.redirect(
          `/dashboard/chamados?message=erro&errorMsg=${JSON.stringify(error)}`
        );
      }

      break;
    case "preventivo":
      try {
        createItem({
          path: `gestaoempresa/business/${req.user.key}/surveys`,
          params: {
            type: "preventivo",
            finished: false,
            accepted: false,
            createdAt: getDate(),
            project: {
              id: data.projectID,
              name: projectData.apelidoProjeto,
            },
            customer: {
              name: customerData.nomeComp
                ? customerData.nomeComp
                : customerData.nomeFantasia,
              document: customerData.cpf ? customerData.cpf : customerData.cnpj,
            },
            status: "Solicitada",
            title: "Chamado Preventivo",
            text: "Chamado PREVENTIVO solicitado para esse projeto.",
          },
        });
        createLogs(req.user.key, `Chamado preventivo para ${data.projectID}`);

        res.redirect("/dashboard/chamados?message=callCreated");
      } catch (error) {
        res.redirect(
          `/dashboard/chamados?message=erro&errorMsg=${JSON.stringify(error)}`
        );
      }

      break;
    case "instalacao":
      try {
        createItem({
          path: `gestaoempresa/business/${req.user.key}/surveys`,
          params: {
            type: "instalacao",
            finished: false,
            accepted: false,
            createdAt: getDate(),
            project: {
              id: data.projectID,
              name: projectData.apelidoProjeto,
            },
            customer: {
              name: customerData.nomeComp
                ? customerData.nomeComp
                : customerData.nomeFantasia,
              document: customerData.cpf ? customerData.cpf : customerData.cnpj,
            },
            status: "Solicitada",
            title: "Chamado de Instalação de Projeto",
            text: "Chamado de instalação solicitado para esse projeto.",
          },
        });
        createLogs(
          req.user.key,
          `Chamado de instalação para ${data.projectID}`
        );
        res.redirect("/dashboard/chamados?message=callCreated");
      } catch (error) {
        res.redirect(
          `/dashboard/chamados?message=erro&errorMsg=${JSON.stringify(error)}`
        );
      }

      break;
    case "corretivo":
      if (data.pics64 === "" || data.pics === "") {
        try {
          createItem({
            path: `gestaoempresa/business/${req.user.key}/surveys`,
            params: {
              type: "corretivo",
              finished: false,
              accepted: false,
              createdAt: getDate(),
              project: {
                id: data.projectID,
                name: projectData.apelidoProjeto,
              },
              customer: {
                name: customerData.nomeComp
                  ? customerData.nomeComp
                  : customerData.nomeFantasia,
                document: customerData.cpf
                  ? customerData.cpf
                  : customerData.cnpj,
              },
              status: "Solicitada",
              title: "Chamado Corretivo",
              text: "Chamado corretivo solicitado para esse projeto.",
              authorPhotos: [],
              authorObs: data.sobrechamado,
            },
          });
          createLogs(req.user.key, `Chamado corretivo para ${data.projectID}`);
          res.redirect("/dashboard/chamados?message=callCreated");
        } catch (error) {
          res.redirect(
            `/dashboard/chamados?message=erro&errorMsg=${JSON.stringify(error)}`
          );
        }
      } else {
        const pictures = JSON.parse(data.pics64);
        let urls = [];
        const storageRef = ref(
          storage,
          `gestaoempresa/business/${req.user.key}/surveys/photos/${
            data.projectID
          }-${new Date()}`
        );
        const promises = pictures.map((pic) => {
          return uploadString(storageRef, pic, "data_url").then((snapshot) => {
            return getDownloadURL(snapshot.ref);
          });
        });

        try {
          Promise.all(promises).then((downloadURLs) => {
            urls = downloadURLs;
            createItem({
              path: `gestaoempresa/business/${req.user.key}/surveys`,
              params: {
                type: "corretivo",
                finished: false,
                accepted: false,
                createdAt: getDate(),
                project: {
                  id: data.projectID,
                  name: projectData.apelidoProjeto,
                },
                customer: {
                  name: customerData.nomeComp
                    ? customerData.nomeComp
                    : customerData.nomefantasia,
                  document: customerData.cpf
                    ? customerData.cpf
                    : customerData.cnpj,
                },
                status: "Solicitada",
                title: "Chamado Corretivo",
                text: "Chamado corretivo solicitado para esse projeto.",
                authorPhotos: urls,
                authorObs: data.sobrechamado,
              },
            });
            createLogs(
              req.user.key,
              `Chamado corretivo para ${data.projectID}`
            );
          });
          res.redirect("/dashboard/chamados?message=callCreated");
        } catch (error) {
          res.redirect(
            `/dashboard/chamados?message=erro&errorMsg=${JSON.stringify(error)}`
          );
        }
      }

      break;
  }
});

router.get("/visualizar/:id", async (req, res, next) => {
  const survey = await getItems({
    path: `gestaoempresa/business/${req.user.key}/surveys/${req.params.id}`,
  });
  const photos = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/surveys/${req.params.id}/photos`,
  });
  const staffEnded = await getItems({
    path: `gestaoempresa/business/${req.user.key}/staffs/${survey.staffEnded}`,
  });
  const notifications = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/notifications`,
  });
  console.log(photos);
  console.log(survey);
  const user = await getUser({ userId: req.user.key });
  const data = {
    user,
    survey,
    photos,
    staffEnded,
    message: null,
    currentPage: res.locals.currentPage,
    notifications,
  };
  res.render("pages/staffs/callsView", data);
});

module.exports = router;
