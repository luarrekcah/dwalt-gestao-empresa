const axios = require("axios"),
asaasAPI = require("node-asaas-api");
require("dotenv").config();

let params = {
  environment: asaasAPI.PRODUCTION,
  apiKey: process.env.asaasApiKey,
  version: "v3",
};

asaasAPI.config(params);

module.exports = {
  getCustomer: async id => {
    const response = await asaasAPI.customers.get(id).then((res)=>{
        return res.data
    })
    return response;
  },
};
