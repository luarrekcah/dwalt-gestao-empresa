const axios = require("axios");

async function getCnpj(req, res, next) {
  let { cnpj } = req.params;
  cnpj = cnpj.replace(/\D/g, "");

  axios
    .get(`https://www.receitaws.com.br/v1/cnpj/${cnpj}`)
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
}

module.exports = {
  getCnpj,
};
