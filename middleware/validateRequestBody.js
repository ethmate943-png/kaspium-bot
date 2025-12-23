const validateRequestBody = (req, res, next) => {
  const requiredFields = ["country", "ipAddress", "browser", "appName"];
  const missingFields = requiredFields.filter((field) => !req.body[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      status: false,
      message: "Data required",
      missingFields,
    });
  }

  next(); // Proceed to the next middleware or route handler
};

module.exports = validateRequestBody;
