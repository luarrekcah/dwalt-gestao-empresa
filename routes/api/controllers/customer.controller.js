const { getItems } = require("../../../database/users");

async function getCustomerByID(req, res, next) {
    let { cID } = req.params;
  const customer = await getItems({
    path: `gestaoempresa/business/${req.user.key}/customers/${cID}`,
  });

  return res.json(customer);
}

module.exports = {
    getCustomerByID,
};