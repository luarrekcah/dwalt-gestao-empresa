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
  });
  
  const projects = await getAllItems({
    path: `gestaoempresa/business/${req.user.key}/projects`,
  });
  
  // Verificar se o kanbanData está vazio ou nulo
  if (!kanbanData || kanbanData.length === 0) {
    kanbanData = [{
      id: 1,
      title: "Pendentes",
      cards: [],
    }];
  }
  
  // Mapeia os IDs dos projetos no Kanban
  const kanbanProjectIds = kanbanData[0].cards.map(card => card.id);
  
  // Verifica se há projetos que não estão no Kanban e os adiciona
  projects.forEach(pj => {
    if (pj.data.status !== "finalizado" && !kanbanProjectIds.includes(pj.key)) {
      // Se o projeto não está finalizado e não está no Kanban, adiciona ao Kanban
      kanbanData[0].cards.push({
        id: pj.key,
        content: pj.data.apelidoProjeto,
        notes: "", // pode ser pj.data.customer.name ou outra informação
      });
    }
  });
  
  // Filtrar os cartões no Kanban e remover aqueles que foram finalizados
  kanbanData[0].cards = kanbanData[0].cards.filter(card => {
    const project = projects.find(pj => pj.key === card.id);
    return project && project.data.status !== "finalizado";
  });
  
  // Atualizar o Kanban com os dados filtrados e atualizados
  await updateItem({
    path: `gestaoempresa/business/${req.user.key}/kanban`,
    params: {
      projects: kanbanData,
    },
  });
  


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
