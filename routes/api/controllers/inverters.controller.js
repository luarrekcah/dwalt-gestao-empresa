const { getAllItems, getItems } = require("../../../database/users");

async function getGrowattData(req, res, next) {
  let { businessKey } = req.params;

  const growattData = await getItems({
    path: `gestaoempresa/business/${businessKey}/growatt`,
  });

  res.json(growattData);
}

module.exports = {
  getGrowattData,
};
