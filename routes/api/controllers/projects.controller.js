const { getAllItems, getItems } = require("../../../database/users");

async function getProjects(req, res, next) {
  let { businessKey } = req.params;
  let {page, limit} = req.query;
 
   if (!businessKey || isNaN(parseInt(page)) || isNaN(parseInt(limit))) {
    return res.status(400).json({ error: 'Parâmetros inválidos' });
  }

  page = parseInt(page);
  limit = parseInt(limit);

  const projects = await getAllItems({
    path: `gestaoempresa/business/${businessKey}/projects`
  });

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedProjects = projects.slice(startIndex, endIndex);

  res.json(paginatedProjects);
}

async function getProject(req, res, next) {
    let { businessKey, projectKey } = req.params;

    const project = await getItems({
        path: `gestaoempresa/business/${businessKey}/projects/${projectKey}`
    });

    res.json(project);
}

module.exports = {
  getProjects,
  getProject
};
