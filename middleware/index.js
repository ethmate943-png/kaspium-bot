const checkApiKey = (req, res, next) => {
  // Check if the x-api-key is present in the request headers
  const apiKey = req.headers["x-api-key"];

  const SECRET_KEY = process.env.SECRET_KEY;

  if (!apiKey) {
    return res.status(401).json({
      status: false,
      message: "Missing x-api-key in request headers",
    });
  }

  if (process.env.ENV === "DEV") {
    if (JSON.parse(apiKey) !== SECRET_KEY) {
      return res.status(419).json({
        status: false,
        message: "Token mismatch",
      });
    }
  }

  if (process.env.ENV === "PROD") {
    if (apiKey !== SECRET_KEY) {
      return res.status(419).json({
        status: false,
        message: "Token mismatch",
      });
    }
  }

  // If the x-api-key is present and valid, proceed to the next middleware or route handler
  next();
};

module.exports = checkApiKey;
