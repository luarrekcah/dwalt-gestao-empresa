const asaasAPI = require("node-asaas-api");
const { getUser } = require("../database/users");

let params = {
  environment: asaasAPI.PRODUCTION,
  apiKey: process.env.asaasApiKey,
  version: "v3",
};

asaasAPI.config(params);

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

    const response = await asaasAPI.subscriptions.get(user.data.subscriptionID);

    const okStatuses = ["ACTIVE", "CONFIRMED", "RECEIVED", "RECEIVED_IN_CASH"];

    console.log(response.data);

    if (response.data.deleted) {
      return { code: false, redirect: `/pagamento/erro?message=deleted_subscription` };
    } else if (okStatuses.includes(response.data.status)) {
      return { code: true, redirect: "/dashboard" };
    } else {
      return { code: false, redirect: `/pagamento/erro?message=pending_subscription` };
    }

    /*
    if (response.data.deleted || !okStatuses.includes(response.data.status)) {
      return { code: false, redirect: "/?message=subscription_error" };
    } else if (
      !response.data.deleted &&
      okStatuses.includes(response.data.status)
    ) {
      return { code: true, redirect: "/dashboard" };
    } else {
      return { code: false, redirect: "/logout" };
    }*/
  },
};