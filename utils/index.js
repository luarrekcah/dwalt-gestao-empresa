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

    if (
      user.data.acessConnect === false ||
      user.data.acessConnect === undefined
    ) {
      return { code: false, redirect: "/pagamento/erro?message=pending_subscription" };
    }

    const response = await asaasAPI.subscriptions.get(user.data.subscriptionID);

    console.log(response.data);

    if (response.data.deleted) {
      return { code: false, redirect: `/pagamento/erro?message=deleted_subscription` };
    } else if (user.data.acessConnect) {
      return { code: true, redirect: "/dashboard" };
    } else {
      return { code: false, redirect: `/pagamento/erro?message=pending_subscription` };
    }
  },
};
