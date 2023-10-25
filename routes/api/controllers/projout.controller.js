async function getProjout(req, res, next) {
  switch (req.params.type) {
    case "messages":
      const data = await getAllItems({
        path: `gestaoempresa/projouts/${req.body.key}/messages`,
      });
      return res.json(data);
  }
}

async function updateProjout(req, res, next) {
  switch (req.params.type) {
    case "obs":
      updateItem({
        path: `gestaoempresa/projouts/${req.body.key}`,
        params: {
          obs: req.body.newStatus,
        },
      });
      return res.sendStatus(200);
    case "confirmPayment":
      updateItem({
        path: `gestaoempresa/projouts/${req.body.key}`,
        params: {
          paymentStatus: "payd",
        },
      });
      return res.sendStatus(200);
    case "updateHistoric":
      createItem({
        path: `gestaoempresa/projouts/${req.body.key}/historic`,
        params: {
          content: req.body.content,
          createdAt: moment().format(),
        },
      });
      return res.sendStatus(200);
    case "newMessage":
      createItem({
        path: `gestaoempresa/projouts/${req.body.key}/messages`,
        params: {
          message: req.body.message,
        },
      });
      return res.sendStatus(200);
  }
}

module.exports = {
  getProjout,
  updateProjout,
};
