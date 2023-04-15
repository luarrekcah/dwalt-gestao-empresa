const {
  getUser,
  updateItem,
  getItems,
  createItem,
  getAllItems,
  deleteItem,
} = require("../database/users");

const express = require("express"),
  router = express.Router();

router.get("/", async (req, res, next) => {
  const user = await getUser({ userId: req.user.key });
  const config = await getItems({
    path: `gestaoempresa/business/${req.user.key}/config`,
  });
  const requiredImages = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/config/projectRequiredImages`,
  });
  let message;
  if (req.query.message) {
    switch (req.query.message.toLowerCase()) {
      case "updated":
        message = {
          type: "success",
          title: "Dados atualizados!",
          description: "Já pode sair desta tela.",
        };
        break;
      case "error":
        message = {
          type: "error",
          title: "Ocorreu um erro!",
          description:
            "Verifique se temos permissão para acessar sua API ou se está com o funcionamento normal.",
        };
        break;
    }
  } else {
    message = null;
  }

  const data = {
    user,
    message,
    config,
    requiredImages,
  };
  res.render("pages/config", data);
});

router.post("/", async (req, res, next) => {
  const data = req.body;
  console.log(data);

  const requiredImages = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/config/projectRequiredImages`,
  });
  if (requiredImages) {
    requiredImages.forEach((r) => {
      if (data[r.key] === "on") {
        updateItem({
          path: `gestaoempresa/business/${req.user.key}/config/projectRequiredImages/${r.key}`,
          params: {
            checked: true,
          },
        });
      } else {
        updateItem({
          path: `gestaoempresa/business/${req.user.key}/config/projectRequiredImages/${r.key}`,
          params: {
            checked: false,
          },
        });
      }
    });
  }

  updateItem({
    path: `gestaoempresa/business/${req.user.key}/config/projectRules`,
    params: {
      needsBasicDocs: data.basicDocs !== "on" ? false : true,
      needsBasicPhotos: data.basicPhotos !== "on" ? false : true,
      onlyAdmEndProject: data.funADMendProject !== "on" ? false : true,
      onlyAdmAcceptSurvey: data.fundADMacceptSurvey !== "on" ? false : true,
      needsStatusReason: data.ProjectStatusReason !== "on" ? false : true,
      StickNotes: data.sticknotes !== "on" ? false : true,
      Alerts: data.notifications !== "on" ? false : true,
      docMinimum: Number(data.docMinimum),
    },
  });

  updateItem({
    path: `gestaoempresa/business/${req.user.key}/config/widgets`,
    params: {
      projectMaps: data.mapWidget !== "on" ? false : true,
      growatt: data.growattWidgets !== "on" ? false : true,
    },
  });

  updateItem({
    path: `gestaoempresa/business/${req.user.key}/config/login`,
    params: {
      hourSpecified: data.hourSpecified,
      loginAlert: data.loginAlert !== "on" ? false : true,
    },
  });

  updateItem({
    path: `gestaoempresa/business/${req.user.key}/config/users`,
    params: {
      passCommon: data.passCommon,
    },
  });
  return res.redirect("/dashboard/configuracao?message=updated");
});

router.post("/addItem", async (req, res, next) => {
  const data = req.body;
  console.log(data);
  createItem({
    path: `gestaoempresa/business/${req.user.key}/config/projectRequiredImages`,
    params: {
      titulo: data.content,
      checked: true,
    },
  });
  return res.redirect("/dashboard/configuracao");
});

router.delete("/item", async (req, res, next) => {
  const data = req.body;
  deleteItem({
    path: `gestaoempresa/business/${req.user.key}/config/projectRequiredImages/${data.key}`,
  });
  return res.redirect("/dashboard/configuracao");
});

module.exports = router;
