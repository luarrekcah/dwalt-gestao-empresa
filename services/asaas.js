const axios = require("axios"),
  asaasAPI = require("node-asaas-api");
require("dotenv").config();

let params = {
  environment: asaasAPI.PRODUCTION,
  apiKey: process.env.asaasApiKey,
  version: "v3",
};

const URL = "https://www.asaas.com/api/v3"

asaasAPI.config(params);

module.exports = {
  getCustomer: async (id) => {
    if (id === undefined) return console.warn("UNDEFINED");
    const response = await asaasAPI.customers.get(id).then((res) => {
      return res.data;
    });
    return response;
  },
  getSubscription: async (id) => {
    if (id === undefined) return console.warn("UNDEFINED");
    const response = await asaasAPI.subscriptions.get(id).then((res) => {
      return res.data;
    });
    return response;
  },
  deleteSubscription: async (id) => {
    if (id === undefined) return console.warn("UNDEFINED");
    const response = await asaasAPI.subscriptions.delete(id).then((res) => {
      return res.data;
    });
    return response;
  },
  getPayment: async (id) => {
    if (id === undefined) return console.warn("UNDEFINED");
    const config = {
      method: "get",
      url: `${URL}/payments/${id}`,
      headers: {
        "Content-Type": "application/json",
        access_token: process.env.asaasApiKey,
      },
    };

    /*const response = await axios(config);

    return response.data;*/

    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.log(error);
      });
  },
  getQR: async id => {
    if (id === undefined) return console.warn("UNDEFINED");
    const config = {
      method: "post",
      url: `${URL}/pix/qrCodes/static`,
      headers: {
        "Content-Type": "application/json",
        access_token: process.env.asaasApiKey,
      },
      data: JSON.stringify({
        "addressKey": "contato@dlwalt.com",
        "description": "Churrasco",
        "value": 10
        })
    };

    const response = await axios(config);

    return response.data;
  }
};
