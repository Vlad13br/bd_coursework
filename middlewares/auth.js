// Міделвар для перевірки авторизації
function isAuthenticated(req, res, next) {
  console.log('Session:', req.session);
  const { user_id } = req.session.user;
  const { id } = req.params;

  if (user_id && user_id === parseInt(id)) {
    return next();
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
}


// Міделвар для перевірки ролі користувача
function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === "admin") {
    return next();
  } else {
    return res.status(403).json({ error: "Forbidden: Admins only" });
  }
}

module.exports = { isAuthenticated, isAdmin };
