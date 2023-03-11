const { getStorage, ref, uploadString, getDownloadURL } = require("@firebase/storage");
const { getDate } = require("../auth/functions/database"),
  { sendNotification } = require("../services/nodemailer"),
  {
    getAllItems,
    updateItem,
    getUser,
    getItems,
    createLogs,
    createItem,
    uploadFile,
  } = require("../database/users"),
  moment = require("../services/moment"),
  axios = require("axios"),
  admin = require("firebase-admin");

const express = require("express"),
  router = express.Router();

const getData = async (res, req) => {
  const projects = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/projects`,
  });
  const growatt = await getItems({
    path: `gestaoempresa/business/${req.user.key}/growatt`,
  });

  axios
    .get("https://openapi.growatt.com/v1/plant/list", {
      headers: { token: req.body.token },
    })
    .then((response) => {
      const data = response.data;
      if (data.error_code !== 0)
        return res.redirect("/dashboard?message=error");
      updateItem({
        path: `gestaoempresa/business/${req.user.key}/growatt/plantList`,
        params: { data },
      });
      updateItem({
        path: `gestaoempresa/business/${req.user.key}/growatt/token`,
        params: {
          lastUse: getDate(),
        },
      });

      return res.redirect("/dashboard");
    });

  projects.forEach((p) => {
    if (
      p.data.username_growatt !== "" &&
      p.data.username_growatt !== undefined &&
      p.data.month_power !== undefined
    ) {
      const username = p.data.username_growatt;
      const plant = growatt.plantList.data.data.plants.find(
        (plant) => plant.name === username
      );
      const data = new Date();

      const now = moment(new Date());
      const date = moment(p.data.month_power.data.lastUpdate);
      const duration = moment.duration(now.diff(date));

      if (duration.asHours() <= 3.0) {
        axios
          .get("https://test.growatt.com/v1/plant/energy", {
            headers: { token: req.body.token },
            params: {
              plant_id: plant.plant_id,
              start_date: plant.create_date,
              end_date: `${data.getFullYear()}-${
                data.getMonth() + 1
              }-${data.getDate()}`,
              time_unit: "month",
            },
          })
          .then((response) => {
            const data = response.data;
            data.lastUpdate = getDate();
            updateItem({
              path: `gestaoempresa/business/${req.user.key}/projects/${p.key}/month_power`,
              params: { data },
            });
          });
      } else {
        return;
      }
    }
  });
};

router.get("/", async (req, res, next) => {
  const projects = await getAllItems({
      path: `gestaoempresa/business/${req.user.key}/projects`,
    }),
    customers = await getAllItems({
      path: `gestaoempresa/business/${req.user.key}/customers`,
    }),
    surveys = await getAllItems({
      path: `gestaoempresa/business/${req.user.key}/surveys`,
    }),
    complaints = await getAllItems({
      path: `gestaoempresa/business/${req.user.key}/complaints`,
    }),
    staffs = await getAllItems({
      path: `gestaoempresa/business/${req.user.key}/staffs`,
    }),
    stickNotes = await getAllItems({
      path: `gestaoempresa/business/${req.user.key}/sticknotes`,
    }),
    growatt = await getItems({
      path: `gestaoempresa/business/${req.user.key}/growatt`,
    }),
    config = await getItems({
      path: `gestaoempresa/business/${req.user.key}/config`,
    }),
    user = await getUser({ userId: req.user.key });

  let message;

  if (req.query.message) {
    switch (req.query.message.toLowerCase()) {
      case "waitmore":
        message = {
          type: "warning",
          title: "Opa! A api da growatt tem limite de requisição.",
          description:
            "Tente novamente daqui algumas horas, o tempo entre as requisições deve ser de 2h e 30min.",
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
      case "notifysend":
        message = {
          type: "success",
          title: "Notificação enviada!",
          description:
            "Você sabia que, 95% das notificações podem ser entregues em 250ms?",
        };
        break;
    }
  } else {
    message = null;
  }

  let kwh = 0;
  if (growatt.plantList) {
    growatt.plantList.data.data.plants.forEach(
      (i) => (kwh = parseInt(i.total_energy) + kwh)
    );
  }

  const data = {
    user,
    projects,
    customers,
    surveys,
    complaints,
    staffs,
    growatt,
    message,
    kwh,
    stickNotes,
    config,
  };
  res.render("pages/dashboard", data);
});

router.post("/", async (req, res, next) => {
  console.log(req.body);
  switch (req.body.type.toLowerCase()) {
    case "reload_growatt":
      const growattData = await getItems({
        path: `gestaoempresa/business/${req.user.key}/growatt`,
      });
      if (
        !growattData &&
        growattData === [] &&
        growattData.token === undefined
      ) {
        getData(res, req);
      } else {
        const now = moment(new Date());
        let date;
        if (growattData.token) {
          date = moment(growattData.token.lastUse);
        } else {
          date = "2020-01-01T23:00:00.956Z";
        }
        const duration = moment.duration(now.diff(date));
        if (duration.asHours() <= 2.5) {
          return res.redirect("/dashboard?message=waitMore");
        } else {
          getData(res, req);
        }
      }
      break;
    case "send_notify":
      let tokens = [],
        emails = [];
      const staffs = await getAllItems({
        path: `gestaoempresa/business/${req.user.key}/staffs`,
      });
      const customers = await getAllItems({
        path: `gestaoempresa/business/${req.user.key}/customers`,
      });
      if (req.body.way === "apps") {
        if (req.body.to === "staffs") {
          staffs.forEach((i) => {
            if (i.data.token) {
              tokens.push(i.data.token);
            }
          });
        } else if (req.body.to === "customers") {
          customers.forEach((i) => {
            if (i.data.token) {
              tokens.push(i.data.token);
            }
          });
        } else {
          customers.forEach((i) => {
            if (i.data.token) {
              tokens.push(i.data.token);
            }
          });
          staffs.forEach((i) => {
            if (i.data.token) {
              tokens.push(i.data.token);
            }
          });
        }
        if (tokens === null) {
          return res.redirect("/dashboard?message=error");
        } else {
          await admin.messaging().sendMulticast({
            tokens,
            notification: {
              title: req.body.notifyTitle,
              body: req.body.notifyMessage,
            },
          });
          return res.redirect("/dashboard?message=notifySend");
        }
      } else if (req.body.way === "email") {
        if (req.body.to === "staffs") {
          staffs.forEach((i) => {
            emails.push(i.data.email);
          });
        } else if (req.body.to === "customers") {
          customers.forEach((i) => {
            emails.push(i.data.email);
          });
        } else {
          customers.forEach((i) => {
            emails.push(i.data.email);
          });
          staffs.forEach((i) => {
            emails.push(i.data.email);
          });
        }
        sendNotification(emails, {
          title: req.body.notifyTitle,
          message: req.body.notifyMessage,
        });
        return res.redirect("/dashboard?message=notifySend");
      } else {
        customers.forEach((i) => {
          if (i.data.token) {
            tokens.push(i.data.token);
          }
          emails.push(i.data.email);
        });
        staffs.forEach((i) => {
          if (i.data.token) {
            tokens.push(i.data.token);
          }
          emails.push(i.data.email);
        });
        sendNotification(emails, {
          title: req.body.notifyTitle,
          message: req.body.notifyMessage,
        });
        await admin.messaging().sendMulticast({
          tokens,
          notification: {
            title: req.body.notifyTitle,
            body: req.body.notifyMessage,
          },
        });
        return res.redirect("/dashboard?message=notifySend");
      }
      break;
    case "mark_read_sticknotes":
      const sticknotes = await getAllItems({
        path: `gestaoempresa/business/${req.user.key}/sticknotes`,
      });
      sticknotes.forEach((i) => {
        updateItem({
          path: `gestaoempresa/business/${req.user.key}/sticknotes/${i.key}`,
          params: {
            read: true,
          },
        });
      });
      return res.redirect("/dashboard");
      break;
  }
});

router.get("/chamados", async (req, res, next) => {
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

router.post("/chamados", async (req, res, next) => {
  console.log(req.body);
  const storage = getStorage();
  const data = req.body;
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
          owner: "",
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
        `gestaoempresa/business/${req.user.key}/surveys/photos/${data.projectID}-${new Date()}`
      );
      const promises = pictures.map(pic => {
        return uploadString(storageRef, pic, "data_url").then((snapshot) => {
          return getDownloadURL(snapshot.ref);
        });
      });
      
      Promise.all(promises).then(downloadURLs => {
        urls = downloadURLs;
        createItem({
          path: `gestaoempresa/business/${req.user.key}/surveys`,
          params: {
            type: "corretivo",
            finished: false,
            accepted: false,
            createdAt: getDate(),
            owner: "",
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

router.get("/localizar/equipe", async (req, res, next) => {
  const teams = await getAllItems({
      path: `gestaoempresa/business/${req.user.key}/teams`,
    }),
    user = await getUser({ userId: req.user.key });
  const data = {
    user,
    teams,
    message: null,
  };
  res.render("pages/staffs/track", data);
});

router.get("/reclamacoes", async (req, res, next) => {
  const complaints = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/complaints/`,
  });
  const user = await getUser({ userId: req.user.key });
  const data = {
    user,
    complaints,
    message: null,
  };
  res.render("pages/customers/complaint", data);
});

module.exports = router;
