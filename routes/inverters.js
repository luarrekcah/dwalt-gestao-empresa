const { getAllItems, getUser, updateItem, getItems } = require("../database/users");

const express = require("express"),
  router = express.Router();

router.get("/growatt", async (req, res, next) => {
  const logs = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}`,
  });
  user = await getUser({ userId: req.user.key });
  const notifications = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/notifications`,
  });
  
  const growattData = await getItems({
    path: `gestaoempresa/business/${req.user.key}/inverters/growatt`,
  });

  const data = {
    user,
    logs,
    message: null,
    notifications,
    growattData
  };
  res.render("pages/inverters/growatt", data);
});

router.post("/growatt", async (req, res, next) => {
  console.log(req.body);

  const data = req.body;

  switch (data.type) {
    case "saveToken":
      updateItem({
        path: `gestaoempresa/business/${req.user.key}/inverters/growatt`,
        params: {
          token: data.token,
        },
      });
      res.sendStatus(200);
      break;
    default:
      res.sendStatus(404);
      break;
  }
});

router.get("/deye", async (req, res, next) => {
  const logs = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}`,
  });
  user = await getUser({ userId: req.user.key });
  const notifications = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/notifications`,
  });
  
  const deyeData = await getItems({
    path: `gestaoempresa/business/${req.user.key}/inverters/deye`,
  });

  const data = {
    user,
    logs,
    message: null,
    notifications,
    deyeData
  };
  res.render("pages/inverters/deye", data);
});

router.post("/deye", async (req, res, next) => {
  console.log(req.body);

  const data = req.body;

  switch (data.type) {
    case "saveConfig":
      updateItem({
        path: `gestaoempresa/business/${req.user.key}/inverters/deye`,
        params: {
          apiid: data.apiid,
          apikey: data.apikey,
        },
      });
      res.sendStatus(200);
      break;
    default:
      res.sendStatus(404);
      break;
  }
});

router.get("/fronius", async (req, res, next) => {
  const logs = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}`,
  });
  user = await getUser({ userId: req.user.key });
  const notifications = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/notifications`,
  });
  const data = {
    user,
    logs,
    message: null,
    notifications,
  };
  res.render("pages/inverters/fronius", data);
});

router.get("/phb", async (req, res, next) => {
  const logs = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}`,
  });
  user = await getUser({ userId: req.user.key });
  const notifications = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/notifications`,
  });
  const data = {
    user,
    logs,
    message: null,
    notifications,
  };
  res.render("pages/inverters/phb", data);
});

router.get("/refusol", async (req, res, next) => {
  const logs = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}`,
  });
  user = await getUser({ userId: req.user.key });
  const notifications = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/notifications`,
  });
  const data = {
    user,
    logs,
    message: null,
    notifications,
  };
  res.render("pages/inverters/refusol", data);
});

module.exports = router;
