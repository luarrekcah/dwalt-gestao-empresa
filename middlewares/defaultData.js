const {version} = require('../package.json')

const defaultData = (req, res, next) => {
    res.locals.defaultData = {
      version,
    };
    next();
  };
  
module.exports = defaultData;