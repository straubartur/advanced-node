const { clearHash } = require('../services/cache')

module.exports = async (req, _, next) => {
  await next();
  if (typeof clearHash === 'function') {
    clearHash(req.user.id);
  }
};