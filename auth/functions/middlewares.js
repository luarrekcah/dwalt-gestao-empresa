const authenticationMiddleware = (req, res, next) => {
    if (!req.isAuthenticated())  
        return res.redirect("/");
  };

module.exports = { authenticationMiddleware };