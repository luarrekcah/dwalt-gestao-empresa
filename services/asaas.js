const axios = require("axios");
require("dotenv").config();

const URL = "https://www.asaas.com/api/v3"

module.exports = {
  getCustomer: async (id) => {
    console.log("AXIOS GET");
    if (id === undefined) return console.warn("UNDEFINED");
    const config = {
      method: "get",
      url: `${URL}/customers/${id}`,
      headers: {
        "Content-Type": "application/json",
        access_token: process.env.asaasApiKey,
      },
      timeout: 5000 
    };

    const response = await axios(config);
    console.log(response);

    return response.data;
  },
  getSubscription: async (id) => {
    if (id === undefined) return console.warn("UNDEFINED");
    const config = {
      method: "get",
      url: `${URL}/subscriptions/${id}`,
      headers: {
        "Content-Type": "application/json",
        access_token: process.env.asaasApiKey,
      },
      timeout: 5000 
    };

    const response = await axios(config);
    console.log(response);

    return response.data;
  },
  deleteSubscription: async (id) => {
    if (id === undefined) return console.warn("UNDEFINED");
    const config = {
      method: "delete",
      url: `${URL}/subscriptions/${id}`,
      headers: {
        "Content-Type": "application/json",
        access_token: process.env.asaasApiKey,
      },
      timeout: 5000 
    };

    const response = await axios(config);
    console.log(response);

    return response.data;
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
      timeout: 5000 
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
  newCustomer: async (data) => {
    const config = {
      method: "post",
      url: `${URL}/customers`,
      headers: {
        "Content-Type": "application/json",
        access_token: process.env.asaasApiKey,
      },
      data,
      timeout: 5000 
    };

    const response = await axios(config);
    console.log(response);

    return response.data;
  },
  newSubscription: async (data) => {
    const config = {
      method: "post",
      url: `${URL}/subscriptions`,
      headers: {
        "Content-Type": "application/json",
        access_token: process.env.asaasApiKey,
      },
      data,
      timeout: 5000 
    };

    const response = await axios(config);
    console.log(response);

    return response.data;
  }
};
