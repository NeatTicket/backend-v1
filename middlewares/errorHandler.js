const httpStatusText = require("../utils/httpStatusText");
const logger = require("../utils/logger");

module.exports = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  if (statusCode === 500) {
    logger.error(`Error: ${error.message}`, error);
  }

  res.status(statusCode).json({ status: httpStatusText.ERROR || 'ERROR', message });
};
