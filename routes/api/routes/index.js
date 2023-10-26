// /api/v1/

const express = require("express"),
  router = express.Router();

const {
  getAllItems,
  getItems,
  updateItem,
  createItem,
} = require("../../../database/users");

const moment = require("moment");

const { get } = require("../controllers/index.controller");
const { sendNotify } = require("../controllers/notification.controller");
const { getCnpj } = require("../controllers/thirdparty.controller");
const { updateSubscriptionValue } = require("../controllers/admin.controller");
const { getProjout } = require("../controllers/projout.controller");
const { getCustomerByID } = require("../controllers/customer.controller");
const { getProjects, getProject } = require("../controllers/projects.controller");
const { getGrowattData } = require("../controllers/inverters.controller");

// Check api
// URL: locahost:3000/api/v1/
router.get("/", get);

// Intern
router.post("/notification", sendNotify);

router.post("/getProjout/:type", getProjout);
router.post("/updateProjout/:type", getProjout);
router.get("/customer/:cID", getCustomerByID);

// Admin
router.post("/updateSubscriptionValue", updateSubscriptionValue);

//Third-Party
router.get("/cnpj/:cnpj", getCnpj);

// Apps API =>
router.get("/projects/:businessKey", getProjects);
router.get("/project/:businessKey/:projectKey", getProject);
//router.get("/projects/search/:businessKey", searchProject);


router.get("/inverters/growatt/:businessKey", getGrowattData);


module.exports = router;
