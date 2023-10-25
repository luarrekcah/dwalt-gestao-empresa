const { getItems, updateItem } = require("../../../database/users");

async function get(req, res, next) {
  res.sendStatus(200);
}

async function updateSubscriptionValue(req, res, next) {
  const business = await getItems({
    path: `gestaoempresa/business/${req.body.key}`,
  });

  if (business.info.email !== "contato@dlwalt.com") {
    return res.sendStatus(403);
  }

  updateItem({
    path: "gestaoempresa/config",
    params: {
      subscriptionValue: Number(req.body.newValue),
    },
  });

  return res.sendStatus(200);
}

module.exports = {
  get,
  updateSubscriptionValue,
};
