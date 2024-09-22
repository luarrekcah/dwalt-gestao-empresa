const express = require("express"),
  router = express.Router();

const { updateItem, getUser, deleteItem, getAllItems, getItems } = require("../database/users");
const { getSubscription, deleteSubscription } = require("../services/asaas");

router.get("/projects", async (req, res, next) => {
  const user = await getUser({ userId: req.user.key });
  const { subscriptionID } = user.data;
  const subs = await getSubscription(subscriptionID);
  const notifications = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/notifications`,
  })
  let kanbanData = await getItems({
    path: `gestaoempresa/business/${req.user.key}/kanban/projects`,
  })

  console.log(kanbanData[0]);

  const projects = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/projects`,
  })


  if (!kanbanData || kanbanData.length === 0) {
    const cards = await projects.map(pj => {
      if (pj.data.status === "finalizado") return;
      return {
        id: pj.key,
        content: pj.data.apelidoProjeto,
        notes: "" // pj.data.customer.name
      }
    });

    kanbanData = [{
      id: 1,
      title: "Pendentes",
      cards,
    }]

    updateItem({
      path: `gestaoempresa/business/${req.user.key}/kanban`,
      params: {
        projects: kanbanData
      }
    })
  }

  /**
   * [
    { id: 101, content: "Tarefa 1", notes: "Anotações para tarefa 1" },
    { id: 102, content: "Tarefa 2", notes: "Anotações para tarefa 2" }
  ]
   */


  const data = {
    user,
    subs,
    message: null,
    notifications,
    kanbanData
  };
  res.render("pages/kanban/projects", data);
});


router.put("/projects", async (req, res, next) => {
  updateItem({
    path: `gestaoempresa/business/${req.user.key}/kanban`,
    params: {
      projects: req.body.kanbanData
    }
  })

  res.sendStatus(200)
})

module.exports = router;
