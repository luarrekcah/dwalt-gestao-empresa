const { getAllItems, updateItem, getItems } = require("../../database/users"),
  { getDate } = require("../../auth/functions/database"),
  moment = require("../moment");

const axios = require("axios");

console.log("[ON] Growatt")

// Configuração base do axios

let axiosConfig = {
  baseURL: "https://openapi.growatt.com/v1/",
  headers: { token: "" },
  params: {},
};

const delay = (min) => {
  const milliseconds = min * 60 * 1000;
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
};

/**
 * Função para verificar erros no request, mesmo que o axios exiba 200,
 * os sistemas da api pode exibir um erro.
 */

const verifyErrors = (res) => {
  if (res.data !== "" && res.status === 200 && res.data.error_code === 0) {
    console.log("Sem erros");
    return true;
  } else {
    console.warn(
      `Erro detectado: reqStatus: ${res.status} || growattStatus: ${res.data.error_code} || errorMsg: ${res.data.error_msg}`
    );
    return false;
  }
};

const getAllBusiness = async () => {
  const business = await getAllItems({ path: `gestaoempresa/business/` });
  return business;
};

const getAllProjects = async (key) => {
  const projects = await getAllItems({
    path: `gestaoempresa/business/${key}/projects`,
  });

  return projects;
};

const getAllSystems = async () => {
  /**
   * COLETA TODOS OS SISTEMAS A CADA 2.5h
   *
   * ATUALIZA OS PARAMETROS DE IDs DE CADA
   * SISTEMA DE ACORDO COM O USUARIO
   */

  const allBusiness = await getAllBusiness();

  for (let index = 0; index < allBusiness.length; index++) {
    // ignora empresas que não possui um token
    const business = allBusiness[index];
    if (
      !business.data.info.tokenGrowatt ||
      business.data.info.tokenGrowatt === ""
    ) {
      return;
    }
    const growattToken = business.data.info.tokenGrowatt;

    axiosConfig.headers.token = growattToken;

    axios.get("plant/list", axiosConfig).then(async (res) => {
      console.log(res.data);
      try {
        if (verifyErrors(res)) {
          const plantsGrowatt = res.data.data.plants;
          const allProjects = await getAllProjects(business.key);

          /**
           * Pegar os projetos da growatt,
           * encontrar o username nos projetos da empresa, verificar se o 'brand' é growatt.
           *
           * se for growatt, adicionar o id da planta no projeto registrado
           */

          for (let index = 0; index < allProjects.length; index++) {
            const project = allProjects[index];

            // Procurar a marca do inversor, default = growatt
            const brandInverter =
              project.data.brand || project.data.inverterType || "growatt";

            if (brandInverter !== "growatt") {
              return;
            }

            // Procurar a planta provida pela growatt com base no array de projetos
            const plantGrowatt = plantsGrowatt.find(
              (obj) => obj.name === project.data.username_growatt
            );

            if (plantGrowatt) {
              /**
               * ENCONTROU.
               * Adicionar parametro do ID da planta para o projeto
               * atualizar outros parametros de dados tambem.
               */

              /* OUTPUT: {
                  total_energy: '4611.7',
                  plant_id: 1730413,
                  country: 'Brazil',
                  latitude_f: null,
                  latitude_d: null,
                  city: 'Rio Branco',
                  image_url: null,
                  latitude: '-9.97472',
                  current_power: '0.0',
                  locale: 'en-US',
                  peak_power: 0.5,
                  operator: '0',
                  installer: '0',
                  user_id: 1962901,
                  name: 'Francisco',
                  create_date: '2022-05-17',
                  status: 4,
                  longitude: '-67.809998'
                }
              */

              updateItem({
                path: `gestaoempresa/business/${business.key}/projects/${project.key}`,
                params: {
                  plantID: plantGrowatt.plant_id,
                  userID: plantGrowatt.user_id,
                },
              });

              // Traduzir significado dos status diretamente

              let status = "Off-line";

              switch (status) {
                case 0:
                  status = "1 - Desconhecido";
                  break;
                case 1:
                  status = "On-line";
                  break;
                case 2:
                  status = "2 - Desconhecido";
                  break;
                case 3:
                  status = "3 - Desconhecido";
                  break;
                default:
                  status = "Off-line";
                  break;
              }

              console.log(`Atualizando o projeto: ${project.key}`);
              updateItem({
                path: `gestaoempresa/business/${business.key}/projects/${project.key}/overview`,
                params: {
                  status,
                  createdAt: plantGrowatt.create_date,
                  total_generated: plantGrowatt.total_energy,
                  kwp: plantGrowatt.peak_power,
                },
              });
            }
          }
        } else {
          await delay(2)
        }
      } catch (error) {
        console.warn(error);
      }
    });
  }
};

/**
 * ATUALIZAR TODOS OS PROJETOS A CADA 3 HORAS
 * Dados essenciais para os projetos e ajustar novos.
 */

setInterval(() => {
  console.log("Coletando todos os sistemas.");
  try {
    getAllSystems();
  } catch (error) {
    console.log(error);
  }
}, 1000 * 60 * 60 * 3);

//http(s)://test.growatt.com/v1/plant/details

/*
 * Coletar todas as empresas
 * coletar os projetos
 * verificar se o plantID existe e se a brand é growatt
 * coletar dados da planta atraves do plantID salvo em cada projeto (5 minutos de intervalo)
 * atualizar o projeto (overview) com os dados fornecidos.
 */

// Fazer com que tenha intervalo de 5 minutos, e quando acabar a execução, executar novamente.

const updateBasicDetailsProjects = async () => {
  const allBusiness = await getAllBusiness();
  let finished = false;

  for (let index = 0; index < allBusiness.length; index++) {
    const business = allBusiness[index];

    if (
      !business.data.info.tokenGrowatt ||
      business.data.info.tokenGrowatt === ""
    ) {
      return;
    }

    const growattToken = business.data.info.tokenGrowatt;

    const allProjects = await getAllProjects(business.key);

    for (let index = 0; index < allProjects.length; index++) {
      const project = allProjects[index];

      if (
        !project.data.plantID &&
        (project.data.brand !== "growatt" ||
          project.data.inverterType !== "growatt")
      ) {
        continue;
      }

      await delay(6);

      axiosConfig.headers.token = growattToken;
      axiosConfig.params.plant_id = project.data.plantID;

      axios.get("plant/details", axiosConfig).then(async (res) => {
        try {
          if (verifyErrors(res)) {
            const detailsData = res.data.data;
            /** OUTPUT:
             * installed_panel_area: '',
              country: 'BurkinaFaso',
              jurisdictionorganization: '',
              notes: '',
              peak_power: 10,
              installed_ac_capacity: '',
              inverters: [ [Object] ],
              state: '',
              create_date: '2022-01-29',
              dataloggers: [ [Object] ],
              longitude: '-67.80271',
              weathersensor_man: '',
              installed_dc_capacity: '',
              weathersensor_num: '',
              designerorganization: '',
              image_url: 'null',
              designercontact: '',
              plant_type: 0,
              offtakerorganization: '',
              operatororganization: '',
              user_id: 1172026,
              name: 'Santana bope',
              irradiationsensor_type: '',
              installerorganization: '',
              weathersensor_md: '',
              postal: '',
              arrays: [ [Object] ],
              maxs: [ [Object] ],
              ownerorganization: 'REAL',
              status: '',
              grid_type: '',
              financiercontact: '',
              city: 'Rio Branco',
              jurisdictioncontact: '',
              timezone: 'GMT-5',
              latitude: '-10.00584',
              installercontact: '',
              weather_type: '',
              description: '',
              locale: 'en_US',
              fixed_azimuth: '',
              currency: 'REAL',
              elevation: '',
              fixed_tilt: '',
              address2: '',
              address1: 'Acre Rio Branco ',
              ownercontact: 'REAL',
              operatorcontact: '',
              financierorganization: '',
              offtakercontact: '',
              tracker_type: ''
             */
            updateItem({
              path: `gestaoempresa/business/${business.key}/projects/${project.key}/overview`,
              params: {
                inverters: detailsData.inverters,
                dataloggers: detailsData.dataloggers,
                arrays: detailsData.arrays,
                maxs: detailsData.maxs,
              },
            });
          } else {
            await delay(3);
          }
        } catch (error) {
          console.log(error);
        }
      });

      if (index === allProjects.length - 1) {
        finished = true;
      }
    }

    if (finished) {
      updateBasicDetailsProjects();
    }
  }
};

updateBasicDetailsProjects();

// plant/data

/**
 * COLETAR DADOS ESSENCIAIS BASICOS DE FUNCIONAMENTO
 */

const updateBasicOverviewProjects = async () => {
  const allBusiness = await getAllBusiness();
  let finished = false;

  for (let index = 0; index < allBusiness.length; index++) {
    const business = allBusiness[index];

    if (
      !business.data.info.tokenGrowatt ||
      business.data.info.tokenGrowatt === ""
    ) {
      return;
    }

    const growattToken = business.data.info.tokenGrowatt;

    const allProjects = await getAllProjects(business.key);

    for (let index = 0; index < allProjects.length; index++) {
      const project = allProjects[index];

      if (
        !project.data.plantID &&
        (project.data.brand !== "growatt" ||
          project.data.inverterType !== "growatt")
      ) {
        continue;
      }

      await delay(6);

      axiosConfig.headers.token = growattToken;
      axiosConfig.params.plant_id = project.data.plantID;

      axios.get("plant/data", axiosConfig).then(async (res) => {
        try {
          if (verifyErrors(res)) {
            const plantBasicData = res.data.data;

            /** OUTPUT:
             * "peak_power_actual": 20,
                "monthly_energy": "15.7",
                "last_update_time": "2018-12-13 11:06:34",
                "current_power": 0,
                "timezone": "GMT+8",
                "yearly_energy": "15.7",
                "today_energy": "0",
                "carbon_offset": "9.4",
                "efficiency": "",
                "total_energy": "15.7"
             */

            updateItem({
              path: `gestaoempresa/business/${business.key}/projects/${project.key}/overview`,
              params: {
                kwp_actual: plantBasicData.peak_power_actual,
                total_generated: plantBasicData.total_energy,
                current_kw: plantBasicData.current_power,
                generationHistoric: {
                  today: plantBasicData.today_energy,
                  month: plantBasicData.monthly_energy,
                  year: plantBasicData.yearly_energy,
                },
                carbon_offset: plantBasicData.carbon_offset,
                lastUpdateTime: getDate(),
              },
            });
          } else {
            await delay(2);
          }
        } catch (error) {
          console.log(error);
        }
      });

      if (index === allProjects.length - 1) {
        finished = true;
      }
    }

    if (finished) {
      updateBasicOverviewProjects();
    }
  }
};

updateBasicOverviewProjects();

// Coletar todos os aparelhos e salvar o SN
const getAllDevices = async () => {
  const allBusiness = await getAllBusiness();

  for (let index = 0; index < allBusiness.length; index++) {
    const business = allBusiness[index];

    if (
      !business.data.info.tokenGrowatt ||
      business.data.info.tokenGrowatt === ""
    ) {
      return;
    }

    const growattToken = business.data.info.tokenGrowatt;

    const allProjects = await getAllProjects(business.key);

    for (let index = 0; index < allProjects.length; index++) {
      const project = allProjects[index];

      if (
        !project.data.plantID &&
        (project.data.brand !== "growatt" ||
          project.data.inverterType !== "growatt")
      ) {
        continue;
      }

      await delay(6);

      axiosConfig.headers.token = growattToken;
      axiosConfig.params.plant_id = project.data.plantID;

      axios.get("device/list", axiosConfig).then(async (res) => {
        try {
          if (verifyErrors(res)) {
            const devices = res.data.data.devices;

            /* OUTPUT
             * 
              [
                {
                    "device_sn": "ZT00100001",
                    "last_update_time": "2018-12-13 11:03:52",
                    "model": "A0B0D0T0PFU1M3S4",
                    "lost": true,
                    "status": 0,
                    "manufacturer": "Growatt",
                    "device_id": 116,
                    "datalogger_sn": "CRAZT00001",
                    "type": 1
                },
                ...
              ]
             */

            updateItem({
              path: `gestaoempresa/business/${business.key}/projects/${project.key}/overview`,
              params: {
                devices,
              },
            });
          } else {
            await delay(2);
          }
        } catch (error) {
          console.log(error);
        }
      });
    }
  }
};

getAllDevices();

setInterval(() => {
  try {
    getAllDevices();
  } catch (error) {
    console.log(error);
  }
}, 1000 * 60 * 60 * 3);

// Checar todos os aparelhos de um projeto
const checkAllAlarms = () => {
// API device/inverter/alarm (needs device_sn)

/*OUTPUT
 * "sn": "LCB1714075",
        "count": 161,
        "alarms": [
            {
                "alarm_code": 25,
                "status": 1,
                "end_time": "2019-03-09 09:55:55.0",
                "start_time": "2019-03-09 09:55:55.0",
                "alarm_message": "No utility."
            }
        ]
 */

// if(device.type === 1)...
}


/*
// only 10 times by day check
const getData = async (dataB) => {
console.log("Getting data");
  axios
    .get("https://openapi.growatt.com/v1/plant/list", {
      headers: { token: dataB.data.info.tokenGrowatt },
    })
    .then((response) => {
      const data = response.data;
      if (data.error_code !== 0) return;
      updateItem({
        path: `gestaoempresa/business/${dataB.key}/growatt/plantList`,
        params: { data },
      });
      updateItem({
        path: `gestaoempresa/business/${dataB.key}/growatt/token`,
        params: {
          lastUse: getDate(),
        },
      });
      console.log(
        "Token atualizado para " + dataB.data.info.documents.nome_fantasia
      );
    });

  const growatt = await getItems({
    path: `gestaoempresa/business/${dataB.key}/growatt`,
  });

  const projects = await getAllItems({
    path: `gestaoempresa/business/${dataB.key}/projects`,
  });

  projects.forEach((p) => {
    if (
      p.data.username_growatt !== "" &&
      p.data.username_growatt !== undefined
    ) {
      const username = p.data.username_growatt;
      const plant = growatt.plantList.data.data.plants.find(
        (plant) => plant.name === username
      );
      const data = new Date();

      const now = moment(new Date());
      let date = moment("01-01-2000", "MM-DD-YYYY");
      if (p.data.month_power) {
        date = moment(p.data.month_power.data.lastUpdate);
      }
      const duration = moment.duration(now.diff(date));

      if (duration.asHours() <= 3.0) {
        setTimeout(() => {
          axios
            .get("https://openapi.growatt.com/v1/plant/energy", {
              headers: { token: dataB.data.info.tokenGrowatt },
              params: {
                plant_id: plant.plant_id,
                start_date: plant.create_date,
                end_date: `${data.getFullYear()}-${
                  data.getMonth() + 1
                }-${data.getDate()}`,
                time_unit: "month",
              },
            })
            .then((response) => {
              const data = response.data;
              data.lastUpdate = getDate();
              updateItem({
                path: `gestaoempresa/business/${dataB.key}/projects/${p.key}/month_power`,
                params: { data },
              });
            });
        }, 5 * 60 * 1000);
      } else {
        return;
      }
    }
  });
};

setInterval(async () => {
  const business = await getAllItems({ path: `gestaoempresa/business/` });
  business.forEach((b) => {
    if (b.data.info.tokenGrowatt) {
      if (b.data.growatt && b.data.growatt.token) {
        const now = moment(new Date());
        const date = moment(b.data.growatt.token.lastUse);
        const duration = moment.duration(now.diff(date));
        if (duration.asHours() >= growattConfig.minimumTime) {
          try {
            getData(b);
          } catch (error) {
            console.log(error);
          }
        }
      } else {
        try {
          getData(b);
        } catch (error) {
          console.log(error);
        }
      }
    }
  });
}, growattConfig.intervalCheckMinutes * 60 * 1000);

setInterval(async () => {
  const business = await getAllItems({ path: `gestaoempresa/business/` });
  business.forEach(async (b) => {
    const projects = await getAllItems({
      path: `gestaoempresa/business/${b.key}/projects`,
    });
    const growatt = await getItems({
      path: `gestaoempresa/business/${b.key}/growatt`,
    });
    projects.forEach(async (p) => {
      if (
        p.data.username_growatt === "" &&
        p.data.username_growatt === undefined
      )
        return;
      const username = p.data.username_growatt;
      if (growatt.plantList === undefined || growatt.plantList.data.data.count === 0) return;
      let plant;
      try {
        plant = growatt.plantList.data.data.plants.find(
        (plant) => plant.name === username
      );
      } catch (error) {
        return console.log(error);
      }
      if (plant === undefined) return;
      console.log(plant);
      setTimeout(() => {
        try {
          axios
          .get("https://openapi.growatt.com/v1/plant/data", {
            headers: { token: b.data.info.tokenGrowatt },
            params: { plant_id: plant.plant_id },
          })
          .then((response) => {
            const data = response.data;
            if (data.error_code !== 0 || data.data.count === 0) return;
            updateItem({
              path: `gestaoempresa/business/${b.key}/projects/${p.key}/overview`,
              params: { data },
            });
            console.log("Update overview data");
          });
        } catch (error) {
          console.log(error);
        }
      }, 5 * 60 * 1000);
    });
  });
}, 6 * 60 * 1000); // 6 minutes

*/
