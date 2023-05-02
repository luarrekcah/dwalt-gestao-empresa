const { getStorage, ref, uploadString, getDownloadURL } = require("@firebase/storage");
const { getAllItems, getUser, createItem, deleteItem } = require("../database/users");

const moment = require("../services/moment");

const express = require("express"),
  router = express.Router();

router.get("/", async (req, res, next) => {
  const projouts = await getAllItems({
      path: `gestaoempresa/projouts/${req.user.key}`,
    }),
    user = await getUser({ userId: req.user.key });
    let message;
  if (req.query.message) {
    switch (req.query.message.toLowerCase()) {
      case "error":
        message = {
          type: "error",
          title: "Ocorreu um erro!",
          description: "Tente novamente mais tarde ou informe nossa equipe.",
        };
        break;
      case "exists":
        message = {
          type: "info",
          title: "Esse projeto já foi enviado e ainda não foi finalizado!",
          description: "Entre em contato com a empresa, você não pode solicitar o mesmo novamente!",
        };
        break;
        case "ok":
          message = {
            type: "success",
            title: "Solicitação enviada!",
            description: "Aguarde resposta da empresa, você receberá mensagens no seu e-mail ou Whatsapp para prosseguir com a solicitação",
          };
          break;
          case "deleted":
            message = {
              type: "success",
              title: "Solicitação deletada!",
              description: "Clique em OK para prosseguir.",
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
    projouts,
    message,
  };
  res.render("pages/projouts", data);
});


router.delete("/", async (req, res, next) => {
  const deleteProjoutId = req.body.id;
  deleteItem({path: `gestaoempresa/projouts/${req.user.key}/${deleteProjoutId}`})
  return res.sendStatus(200);
})

router.get("/novo", async (req, res, next) => {
  const projects = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/projects`,
  });
  const user = await getUser({ userId: req.user.key });
  const data = {
    user,
    message: null,
    projects,
  };
  res.render("pages/projouts/new", data);
});

router.post("/novo", async (req, res, next) => {
  const storage = getStorage();
  const body = req.body;
  
  const user = await getUser({ userId: req.user.key });

  const projouts = await getAllItems({
    path: `gestaoempresa/projouts/${req.user.key}`,
  });

  const find = projouts.find((pj) => pj.data.project.id === body.data.projectId);

  if (find) {
    return res.redirect("/dashboard/projetos/terceirizar?message=exists");
  } else {
    let promises = [];
    for (let index = 0; index < body.data.docs.length; index++) {
      const file = body.data.docs[index];
      let fileType;
      switch (file.type) {
        case "image/jpeg":
          fileType = "jpg";
          break;
        case "image/png":
          fileType = "png";
          break;
        case "application/pdf":
          fileType = "pdf";
          break;
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          fileType = "docx";
          break;
        case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
          fileType = "xlsx";
          break;
        case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
          fileType = "pptx";
          break;
        default:
          fileType = file.type.split("/")[1];
          break;
      }
      const path = `gestaoempresa/projouts/${
        req.user.key
      }/files/${new Date().getTime()}-${index}.${fileType}`;

      const storageRef = ref(storage, path);

      try {
        const promise = uploadString(storageRef, file.base64, "data_url").then((snapshot) => {
          return getDownloadURL(snapshot.ref).then((downloadURL) => {
            return {
              timestamp: new Date().getTime(),
              path,
              downloadURL,
            };
          });
        });
        promises.push(promise);
      } catch (error) {
        console.log(error);
      }
    }

    Promise.all(promises).then((filesPaths) => {
        createItem({
          path: `gestaoempresa/projouts/${req.user.key}`,
          params: {
            project: {
                id: body.data.projectId,
                name: body.data.projectName
            },
            owner: {
                id: req.user.key,
                name: user.data.documents.nome_fantasia,
                logo: user.data.profile.logo,
                email: user.data.email
            },
            filesPaths,
            status: 'solicited',
            createdAt: moment().format(),
            obs: '',
            paymentStatus: 'pending',
            finished: false,
          },
        });
      
        // Send notify to d walt
      
        return res.redirect("/dashboard/projetos/terceirizar?message=ok");
      }).catch((error) => {
        console.log(error);
        return res.redirect("/dashboard/projetos/terceirizar?message=error");
      });
  }
});

module.exports = router;
