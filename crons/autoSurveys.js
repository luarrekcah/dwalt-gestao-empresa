const cron = require('node-cron');

const verifyProjects = async () => {
    // do anything
}

const autoSurvey = () => {
    // Todos os dias às 8
    cron.schedule('0 8 * * *', async () => {
        await verifyProjects()
    });
};

module.exports = autoSurvey;
