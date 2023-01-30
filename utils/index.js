const { getUser } = require("../database/users");
require("dotenv").config();

const axios = require("axios");

const URL = "https://www.asaas.com/api/v3"

module.exports = {
  subscriptionChecker: async (req) => {
    if (req.user === undefined) return { code: false, redirect: "/" };

    const user = await getUser({ userId: req.user.key });

    if (user.data.asaasID === "" || user.data.asaasID === undefined) {
      return { code: false, redirect: "/pagamento" };
    }

    if (
      user.data.subscriptionID === "" ||
      user.data.subscriptionID === undefined
    ) {
      return { code: false, redirect: "/pagamento/assinatura" };
    }

    if (
      user.data.acessConnect === false ||
      user.data.acessConnect === undefined
    ) {
      return { code: false, redirect: "/pagamento/erro?message=pending_subscription" };
    }

    const config = {
      method: "get",
      url: `${URL}/subscriptions/${user.data.subscriptionID}`,
      headers: {
        "Content-Type": "application/json",
        access_token: process.env.asaasApiKey,
      },
    };

    const response = await axios(config);

    if (response.data.deleted) {
      return { code: false, redirect: `/pagamento/erro?message=deleted_subscription` };
    } else if (user.data.acessConnect && response.data.status === 'ACTIVE') {
      return { code: true, redirect: "/dashboard" };
    } else {
      return { code: false, redirect: `/pagamento/erro?message=pending_subscription` };
    }
  },
};
