const { countItems } = require("../../../database/users");

async function getStatistics(req, res, next) {
  let { businessKey } = req.params;

  const pjLength = await countItems({
    path: `gestaoempresa/business/${businessKey}/projects`,
  });
  const staffsLength = await countItems({
    path: `gestaoempresa/business/${businessKey}/staffs`,
  });
  const customersLength = await countItems({
    path: `gestaoempresa/business/${businessKey}/customers`,
  });

  res.json({
    pjLength,
    staffsLength,
    customersLength,
  });
}

module.exports = {
  getStatistics,
};
