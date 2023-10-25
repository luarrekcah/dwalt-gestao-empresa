const { getAllItems, getItems } = require("../../../database/users");

async function getGrowattData(req, res, next) {
  const growattData = await getAllItems({
    path: `gestaoempresa/business/${businessKey}/growatt`,
  });
  
  res.json(growattData);
}

module.exports = {
  getGrowattData,
};
