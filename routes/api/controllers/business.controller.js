const { getAllItems } = require("../../../database/users");

async function findBusiness(req, res, next) {
  try {
    let { email } = req.query;

    const allBusiness = await getAllItems({
      path: `gestaoempresa/business/${businessKey}/projects/${projectKey}`,
    });

    if (email) {
      const business = await allBusiness.find((bu) => bu.data.email === email);

      res.json(business);
    }

    res.sendStatus(400);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

module.exports = {
  findBusiness,
};
