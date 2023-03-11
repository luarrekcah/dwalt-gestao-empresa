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
  const user = await getUser({ userId: req.user.key });
  const data = {
    user,
    surveys,
    projects,
    message: null,
  };
  res.render("pages/staffs/calls", data);
});

router.post("/", async (req, res, next) => {
  console.log(req.body);
  const storage = getStorage();
  const data = req.body;

  const cID = await getItems({path: `gestaoempresa/business/${req.user.key}/projects/${data.projectID}/customerID`});
  const cpf = await getItems({path: `gestaoempresa/business/${req.user.key}/customers/${cID}/cpf`})
  
  switch (data.type) {
    case "concludeCall":
      updateItem({
        path: `gestaoempresa/business/${req.user.key}/surveys/${data.surveyId}`,
        params: {
          finished: true,
          status: "Solicitação finalizada",
        },
      });
      createLogs(req.user.key, "Chamado finalizado");
      break;
    case "preventivo":
     createItem({
        path: `gestaoempresa/business/${req.user.key}/surveys`,
        params: {
          type: "preventivo",
          finished: false,
          accepted: false,
          createdAt: getDate(),
          owner: cpf,
          projectId: data.projectID,
          status: "Solicitada",
          title: "Chamado Preventivo",
          text: "Chamado PREVENTIVO solicitado para esse projeto.",
        },
      });
      createLogs(req.user.key, `Chamado preventivo para ${data.projectID}`);
      break;
    case "corretivo":
      
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

      Promise.all(promises).then((downloadURLs) => {
        urls = downloadURLs;
        createItem({
          path: `gestaoempresa/business/${req.user.key}/surveys`,
          params: {
            type: "corretivo",
            finished: false,
            accepted: false,
            createdAt: getDate(),
            owner: cpf,
            projectId: data.projectID,
            status: "Solicitada",
            title: "Chamado Corretivo",
            text: "Chamado corretivo solicitado para esse projeto.",
            authorPhotos: urls,
            authorObs: data.sobrechamado,
          },
        });
        createLogs(req.user.key, `Chamado corretivo para ${data.projectID}`);
      });

      break;
  }

  return res.redirect("/dashboard/chamados");
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
    console.log(photos);
    console.log(survey);
    const user = await getUser({ userId: req.user.key });
    const data = {
      user,
      survey,
      photos,
      staffEnded,
      message: null,
    };
    res.render("pages/staffs/callsView", data);
  });

module.exports = router;
