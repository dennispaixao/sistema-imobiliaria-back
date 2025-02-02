const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",").map(origin => origin.trim();
console.log(allowedOrigins);
module.exports = allowedOrigins;
