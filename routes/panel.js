const { getAllItems, getUser, getItems } = require("../database/users");
const { businessNotify } = require("../utils");

const express = require("express"),
  router = express.Router();

router.get("/", async (req, res, next) => {
  const projouts = await getAllItems({ path: `gestaoempresa/projouts` });
  (user = await getUser({ userId: req.user.key })),
    (bLength = await getAllItems({ path: `gestaoempresa/business` })),
    (subscriptionValue = await getItems({
      path: "gestaoempresa/config/subscriptionValue",
    }));

    const  notifications = await getAllItems({
      path: `gestaoempresa/business/${req.user.key}/notifications`,
    })

  if (user.data.email !== "contato@dlwalt.com") {
    return res.redirect("/dashboard");
  }

  const overview = {
    businessLength: bLength.length,
  };

  console.log(projouts);

  const data = {
    user,
    projouts,
    message: null,
    overview,
    currentPage: res.locals.currentPage,
    subscriptionValue,
    allBusiness: bLength,
    notifications
  };
  res.render("pages/panel", data);
});

router.post("/", async (req, res, next) => {
  console.log(req.body);
  const data = req.body;
  switch (data.type) {
    case "SEND_BNOTIFY":
      try {
        businessNotify(data.notifyMessage, data.icon, data.style, "all");
        return res.redirect('/dlwalt');
      } catch (error) {
        console.log(error);
      }
      break;
  }
});

router.get("/visualizar/:id", async (req, res, next) => {
  const projoutInfo = await getItems({
      path: `gestaoempresa/projouts/${req.params.id}`,
    }),
    user = await getUser({ userId: req.user.key });

    const  notifications = await getAllItems({
      path: `gestaoempresa/business/${req.user.key}/notifications`,
    })

  projoutInfo.key = req.params.id;

  const messages = await getAllItems({
    path: `gestaoempresa/projouts/${req.params.id}/messages`,
  });

  const projectInfo = await getItems({
    path: `gestaoempresa/business/${projoutInfo.owner.id}/projects/${projoutInfo.project.id}`,
  });
  const projectDocs = await getAllItems({
    path: `gestaoempresa/business/${projoutInfo.owner.id}/projects/${projoutInfo.project.id}/documents`,
  });
  const customerPhotos = await getAllItems({
    path: `gestaoempresa/business/${projoutInfo.owner.id}/customers/${projectInfo.customerID}/photos`,
  });

  const data = {
    user,
    projoutInfo,
    projectDocs,
    customerPhotos,
    messages,
    message: null,
    notifications
  };

  res.render("pages/panel/details", data);
});

module.exports = router;
