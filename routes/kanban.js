const express = require("express"),
  router = express.Router();

const { updateItem, getUser, deleteItem, getAllItems } = require("../database/users");
const { getSubscription, deleteSubscription } = require("../services/asaas");

router.get("/projects", async (req, res, next) => {
  const user = await getUser({ userId: req.user.key });
  const { subscriptionID } = user.data;
  const subs = await getSubscription(subscriptionID);
  const  notifications = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/notifications`,
  })
  const data = {
    user,
    subs,
    message: null,
    notifications
  };
  res.render("pages/kanban/projects", data);
});

module.exports = router;
