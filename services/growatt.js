const { getAllItems, updateItem } = require("../database/users")
    , { getDate } = require("../auth/functions/database")
    , moment = require('./moment')
    , axios = require("axios");

const growattConfig = {
    minimumTime: 2.5,
    intervalCheckHours: 3
};

console.log("[GROWATT] Monitoramento ativo");
const getData = async (dataB) => {
    axios.get("https://test.growatt.com/v1/plant/list", { headers: { token: dataB.data.info.tokenGrowatt } })
        .then(response => {
            const data = response.data
            if (data.error_code !== 0) return;
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

        const growatt = await getItems({path: `gestaoempresa/business/${dataB.key}/growatt`});

            projects.forEach(p => {
                if(p.data.username_growatt !== '' && p.data.username_growatt !== undefined) {
                    const username = p.data.username_growatt;
                    const plant = growatt.plantList.data.data.plants.find(plant => plant.name === username);
                    const data = new Date();
    
                    const now = moment(new Date());
                    const date = moment(p.data.month_power.data.lastUpdate);
                    const duration = moment.duration(now.diff(date));
                    
                    if (duration.asHours() <= 3.0) {
                        axios.get("https://test.growatt.com/v1/plant/energy",
                        {
                            headers: { token: dataB.data.info.tokenGrowatt },
                            params: {
                                plant_id: plant.plant_id,
                                start_date: plant.create_date,
                                end_date: `${data.getFullYear()}-${data.getMonth() + 1}-${data.getDate()}`, 
                                time_unit: 'month',
                            }
                        })
                        .then(response => {
                            const data = response.data;
                            data.lastUpdate = getDate();
                            updateItem({
                                path: `gestaoempresa/business/${dataB.key}/projects/${p.key}/month_power`, params: { data }
                            });
                        });
                    } else {
                        return;
                    } 
                }
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