const authenticationMiddleware = (req, res, next) => {
    if (!req.isAuthenticated()) 
        return res.redirect("/");
  };

  const authenticationMiddlewareTrueFalse = (req, res, next) => {
    if (!req.isAuthenticated()) {
      return false;
    } else {
      return true;
    }
  };

module.exports = { authenticationMiddleware, authenticationMiddlewareTrueFalse };