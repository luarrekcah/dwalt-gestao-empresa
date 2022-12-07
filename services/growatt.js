const { getAllItems, updateItem, getUser, getItems } = require("../database/users")
    , { getDate } = require("../auth/functions/database")
    , moment = require('./moment');
axios = require('axios');

const growattConfig = {
    minimumTime: 2.5,
    intervalCheckHours: 3
};

console.log("[GROWATT] Monitoramento ativo");
const getData = (dataB) => {
    axios.get("https://test.growatt.com/v1/plant/list", { headers: { token: dataB.data.info.tokenGrowatt } })
        .then(response => {
            const data = response.data.data;
            if (response.data.error_code !== 0) return;
            updateItem({
                path: `gestaoempresa/business/${dataB.key}/growatt/plantList`, params: { data }
            });
            updateItem({
                path: `gestaoempresa/business/${dataB.key}/growatt/token`, params: {
                    lastUse: getDate(),
                }
            });
            console.log("Token atualizado para " + dataB.data.info.documents.nome_fantasia);
        });
}

setInterval(async () => {
    const business = await getAllItems({ path: `gestaoempresa/business/` });
    business.forEach(b => {
        if (b.data.info.tokenGrowatt) {
            if (b.data.growatt.token) {
                const now = moment(new Date());
                const date = moment(b.data.growatt.token.lastUse);
                const duration = moment.duration(now.diff(date));
                if (duration.asHours() >= growattConfig.minimumTime) {
                    getData(b);
                }
            } else {
                getData(b);
            }
        }
    });
}, growattConfig.intervalCheckHours * 60 * 1000)