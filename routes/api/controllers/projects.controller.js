const { getAllItems, getItems } = require("../../../database/users");

async function getProjects(req, res, next) {
  let { businessKey } = req.params;
  let { page, limit } = req.query;

  if (!businessKey) {
    return res.status(400).json({ error: 'Parâmetros inválidos' });
  }

  page = page ? parseInt(page) : 1;
  limit = limit ? parseInt(limit) : null; 

  const projects = await getAllItems({
    path: `gestaoempresa/business/${businessKey}/projects`
  });

  let paginatedProjects;

  if (limit) {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    paginatedProjects = projects.slice(startIndex, endIndex);
  } else {
    paginatedProjects = projects; 
  }

  res.json(paginatedProjects);
}


async function getProject(req, res, next) {
    let { businessKey, projectKey } = req.params;

    const project = await getItems({
        path: `gestaoempresa/business/${businessKey}/projects/${projectKey}`
    });

    res.json(project);
}

async function searchProject(req, res, next) {
  let { businessKey } = req.params;
  let { query } = req.query;

  const project = await getItems({
      path: `gestaoempresa/business/${businessKey}/projects/${projectKey}`
  });

  res.json(project);
}

module.exports = {
  getProjects,
  getProject
};
