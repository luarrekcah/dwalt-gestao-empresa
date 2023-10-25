const { getAllItems } = require("../../../database/users");

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

module.exports = {
  getProjects,
};
