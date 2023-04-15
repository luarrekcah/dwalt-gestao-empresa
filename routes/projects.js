const express = require("express"),
  router = express.Router(),
  moment = require("../services/moment"),
  { getDate } = require("../auth/functions/database"),
  {
    createItem,
    getAllItems,
    getItems,
    getUser,
    deleteItem,
    updateItem,
    createLogs,
  } = require("../database/users");
const {
  getStorage,
  ref,
  uploadString,
  deleteObject,
  getDownloadURL,
} = require("@firebase/storage");

router.get("/", async (req, res, next) => {
  const projects = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/projects`,
  });
  const user = await getUser({ userId: req.user.key });

  let message;
  if (req.query.message) {
    switch (req.query.message.toLowerCase()) {
      case "registrado":
        message = {
          type: "success",
          title: "Projeto registrado!",
          description: "Clique em OK para ver as informações atualizadas.",
        };
        break;
      case "deletado":
        message = {
          type: "success",
          title: "Projeto deletado!",
          description: "Clique em OK para ver as informações atualizadas.",
        };
        break;
      case "semcliente":
        message = {
          type: "warning",
          title: "Sem cliente!",
          description:
            "Você não selecionou o cliente na tela de registro de projeto, caso não tenha registrado, vá em CLIENTES > GERENCIAR.",
        };
        break;
      default:
        message = null;
        break;
    }
  } else {
    message = null;
  }

  const data = {
    user,
    projects,
    message,
  };
  res.render("pages/projects", data);
});

router.post("/", async (req, res, next) => {
  if (!req.body.type) return res.redirect("/dashboard?message=wrongtry");
  switch (req.body.type) {
    case "DELETE_PROJECT":
      deleteItem({
        path: `gestaoempresa/business/${req.user.key}/projects/${req.body.projectId}`,
      });
      return res.redirect("/dashboard/projetos?message=deletado");
      break;
  }
});

router.get("/adicionar", async (req, res, next) => {
  const user = await getUser({ userId: req.user.key });
  const customers = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/customers`,
  });
  const data = {
    user,
    message: null,
    customers,
  };
  res.render("pages/projects/new", data);
});

router.post("/adicionar", (req, res, next) => {
  const project = req.body;
  project.createdAt = getDate(moment);
  console.log(project);
  if (project.customerID === "Nenhum selecionado")
    return res.redirect("/dashboard/projetos?message=semcliente");
  createItem({
    path: `gestaoempresa/business/${req.user.key}/projects`,
    params: project,
  });
  createLogs(req.user.key, "Projeto adicionado.");
  return res.redirect("/dashboard/projetos?message=registrado");
});

router.get("/visualizar/:id", async (req, res, next) => {
  const user = await getUser({ userId: req.user.key });
  const project = await getItems({
    path: `gestaoempresa/business/${req.user.key}/projects/${req.params.id}`,
  });
  const growatt = await getItems({
    path: `gestaoempresa/business/${req.user.key}/growatt`,
  });
  const overview = await getItems({
    path: `gestaoempresa/business/${req.user.key}/projects/${req.params.id}/overview`,
  });
  const documents = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/projects/${req.params.id}/documents`,
  });
  const photos = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/projects/${req.params.id}/photos`,
  });
  const requiredPhotos = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/projects/${req.params.id}/requiredPhotos`,
  });
  const requiredPhotosConfig = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/config/projectRequiredImages`,
  });
  const historic = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/projects/${req.params.id}/historic`,
  });

  let required = [];

  requiredPhotosConfig.forEach((rq) => {
    if (!rq.data.checked) return;
    const find = requiredPhotos.find((i) => i.key === rq.key);
    if (find) {
      required.push({
        key: rq.key,
        data: rq.data,
        array: find.data,
      });
    } else {
      required.push({
        key: rq.key,
        data: rq.data,
      });
    }
  });

  let message;
  let growattData = [];
  if (growatt && growatt.plantList) {
    growattData = growatt.plantList.data.data.plants.find(
      (g) => g.name === project.username_growatt
    );
  }
  if (req.query.message) {
    switch (req.query.message.toLowerCase()) {
      case "editado":
        message = {
          type: "success",
          title: "Projeto editado!",
          description: "Clique em OK para ver as informações atualizadas.",
        };
        break;
      case "criado":
        message = {
          type: "success",
          title: "Documento adicionado!",
          description: "Clique em OK para ver as informações atualizadas.",
        };
        break;
      case "deletado":
        message = {
          type: "success",
          title: "Documento deletado!",
          description: "Clique em OK para ver as informações atualizadas.",
        };
        break;
      case "missingrequiredphotos":
        message = {
          type: "warning",
          title: "Não podemos fechar seu projeto.",
          description:
            "Verificamos que há fotos obrigatórias pendentes para este projeto, adicione todas para finalizar.",
        };
        break;
      default:
        message = null;
        break;
    }
  } else {
    message = null;
  }

  const power = [],
    labelsMonths = [];

  if (project.month_power) {
    project.month_power.data.data.energys.forEach((m) => {
      const month = m.date.split("-")[1];
      switch (month) {
        case "01":
          labelsMonths.push("Jan");
          break;
        case "02":
          labelsMonths.push("Fev");
          break;
        case "03":
          labelsMonths.push("Mar");
          break;
        case "04":
          labelsMonths.push("Abr");
          break;
        case "05":
          labelsMonths.push("Mai");
          break;
        case "06":
          labelsMonths.push("Jun");
          break;
        case "07":
          labelsMonths.push("Jul");
          break;
        case "08":
          labelsMonths.push("Ago");
          break;
        case "09":
          labelsMonths.push("Set");
          break;
        case "10":
          labelsMonths.push("Out");
          break;
        case "11":
          labelsMonths.push("Nov");
          break;
        case "12":
          labelsMonths.push("Dez");
          break;
      }
      power.push(m.energy);
    });
  }

  const labels = JSON.stringify(labelsMonths);
  const dataChart = JSON.stringify(power);

  const data = {
    user,
    project,
    documents,
    message,
    photos,
    growattData,
    labels,
    dataChart,
    overview,
    required,
    historic,
  };
  res.render("pages/projects/see", data);
});

router.post("/visualizar/:id", async (req, res, next) => {
  const storage = getStorage();

  let status;
  switch (req.body.type) {
    case "CREATE_DOCUMENT":
      status = "criado";
      const data = req.body;
      const storageRef = ref(
        storage,
        `gestaoempresa/business/${req.user.key}/projects/${req.params.id}/documents/${data.documentName}.pdf`
      );
      uploadString(storageRef, data.documentBase64, "data_url").then(
        (snapshot) => {
          console.log(snapshot);
          getDownloadURL(snapshot.ref).then((downloadURL) => {
            createItem({
              path: `gestaoempresa/business/${req.user.key}/projects/${req.params.id}/documents`,
              params: {
                documentName: data.documentName,
                documentURL: downloadURL,
                createdAt: getDate(),
              },
            });
            createLogs(req.user.key, "Documento adicionado a um projeto.");
          });
        }
      );
      break;
    case "DELETE_DOCUMENT":
      status = "deletado";
      deleteItem({
        path: `gestaoempresa/business/${req.user.key}/projects/${req.params.id}/documents/${req.body.documentId}`,
      });
      const desertRef = ref(
        storage,
        `gestaoempresa/business/${req.user.key}/projects/${req.params.id}/documents/${req.body.documentName}.pdf`
      );
      deleteObject(desertRef)
        .then(() => {
          console.log("Deletado");
        })
        .catch((error) => {
          console.log("Erro", error);
        });
      createLogs(req.user.key, "Documento deletado de um projeto.");
      break;
    case "DELETE_PHOTO":
      status = "deletado";
      const fotos = Number(req.body.photosQuantity);
      deleteItem({
        path: `gestaoempresa/business/${req.user.key}/projects/${req.params.id}/requiredPhotos/${req.body.photoId}`,
      });
      for (let index = 0; index < fotos; index++) {
        const photoRef = ref(
          storage,
          `gestaoempresa/business/${req.user.key}/projects/${
            req.params.id
          }/requiredPhotos/${req.body.photoName
            .replaceAll(" ", "-")
            .toLowerCase()}-${index}.jpg`
        );
        deleteObject(photoRef)
          .then(() => {
            console.log("Deletado");
          })
          .catch((error) => {
            console.log("Erro", error);
          });
        createLogs(req.user.key, "Foto deletada de um projeto.");
      }
      break;
  }
  return res.redirect(
    "/dashboard/projetos/visualizar/" +
      req.params.id +
      "?message=" +
      status +
      "#imagens_obrigatorias"
  );
});

router.get("/editar/:id", async (req, res, next) => {
  const customers = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/customers`,
  });
  const user = await getUser({ userId: req.user.key });
  const project = await getItems({
    path: `gestaoempresa/business/${req.user.key}/projects/${req.params.id}`,
  });
  const data = {
    user,
    project,
    message: null,
    customers,
  };
  res.render("pages/projects/edit", data);
});

router.post("/editar/:id", async (req, res, next) => {
  const projectStatus = await getItems({
    path: `gestaoempresa/business/${req.user.key}/projects/${req.params.id}/Status`,
  });
  console.log(req.body);
  if (req.body.Status === "finalizado" && projectStatus !== "finalizado") {
    const requiredPhotosConfig = await getAllItems({
      path: `gestaoempresa/business/${req.user.key}/config/projectRequiredImages`,
    });
    const requiredPhotos = await getAllItems({
      path: `gestaoempresa/business/${req.user.key}/projects/${req.params.id}/requiredPhotos`,
    });
    let required = [];

    requiredPhotosConfig.forEach((rq) => {
      if (!rq.data.checked) return;
      const find = requiredPhotos.find((i) => i.key === rq.key);
      if (!find) {
        required.push({
          key: rq.key,
          data: rq.data,
        });
      } else {
        return;
      }
    });

    console.log(required);

    if (required.length !== 0) {
      return res.redirect(
        "/dashboard/projetos/visualizar/" +
          req.params.id +
          "?message=missingRequiredPhotos#imagens_obrigatorias"
      );
    } else {
      updateItem({
        path: `gestaoempresa/business/${req.user.key}/projects/${req.params.id}`,
        params: req.body,
      });
      createLogs(req.user.key, "Projeto atualizado.");
      return res.redirect(
        "/dashboard/projetos/visualizar/" + req.params.id + "?message=editado"
      );
    }
  } else {
    updateItem({
      path: `gestaoempresa/business/${req.user.key}/projects/${req.params.id}`,
      params: req.body,
    });
    createLogs(req.user.key, "Projeto atualizado.");
    return res.redirect(
      "/dashboard/projetos/visualizar/" + req.params.id + "?message=editado"
    );
  }
});

router.get("/pendentes", async (req, res, next) => {
  const pendingProjects = [];
  const user = await getUser({ userId: req.user.key });
  const business = await getItems({
    path: `gestaoempresa/business/${req.user.key}`,
  });

  const businessRequiredPhotosLength = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/config/projectRequiredImages`,
  });

  const projects = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/projects`,
  });

  if (business.config && business.config.projectRules) {
    for (pj of projects) {
      const docs = await getAllItems({
        path: `gestaoempresa/business/${req.user.key}/projects/${pj.key}/documents`,
      });

      const requiredPhotos = await getAllItems({
        path: `gestaoempresa/business/${req.user.key}/projects/${pj.key}/requiredPhotos`,
      });

      if (!(business.config.projectRules.docMinimum - docs.length <= 0) || (businessRequiredPhotosLength.length - requiredPhotos.length) !== 0) {
        pendingProjects.push({
          key: pj.key,
          title: pj.data.apelidoProjeto,
          documents: {
            left: business.config.projectRules.docMinimum - docs.length,
            total: business.config.projectRules.docMinimum,
          },
          pictures: {
            left:
              businessRequiredPhotosLength.length -
              requiredPhotos.length,
            total: businessRequiredPhotosLength.length,
          },
        });
      }
    }
  }

  const data = {
    user,
    message: null,
    pendingProjects,
  };
  res.render("pages/projects/pending", data);
});

module.exports = router;
