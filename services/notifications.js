const axios = require("axios");
const { getAllItems } = require("../database/users");

const checkPendingSurveys = async () => {
  const business = await getAllItems({ path: `gestaoempresa/business/` });
  business.forEach(async (b) => {
    const surveys = await getAllItems({
      path: `gestaoempresa/business/${b.key}/surveys`,
    });
    let allSurveys = 0;
    let nonEndedSurveys = 0;
    surveys.forEach((s) => {
      if (!s.data.accepted) {
        allSurveys++;
      } else if (s.data.accepted && !s.data.finished) {
        nonEndedSurveys++;
      }
    });

    const body = `${
      allSurveys > 0
        ? `Há ${allSurveys} chamados pendentes para ser aceitos.`
        : ""
    }${
      nonEndedSurveys > 1 ? `Há ${nonEndedSurveys} aguardando finalização.` : ""
    }`;

    if (body === "") return;

    const params = new URLSearchParams({
      title: `Ainda tem chamados ativos!`,
      body,
      key: b.key,
      to: "staffs",
    }).toString();

    axios
      .post(`https://connect.dlwalt.com/api/v1/notification?${params}`)
      .then((r) => {
        console.log(r.data);
      });
  });
};

setInterval(() => {
checkPendingSurveys();
}, 1000 * 60 * 60 * 2);
