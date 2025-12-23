# Telegram Bot Message Sender

This is a Node.js project designed for sending messages to a Telegram bot. The project uses the Telegram Bot API to send customized messages to specified chat IDs

## Prerequisites

Before setting up the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A Telegram bot token
- The chat ID you want to send messages to.

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/telegram-bot-message-sender.git
cd telegram-bot-message-sender
```

# Install Dependencies

```bash
npm install
```

# Set Environment Variables
NOTIFICATION_TOKEN 
NOTIFICATION_CHAT_ID
npm run dev
```

# Test the API

You can use tools like Postman or the VSCode REST Client to test the API.

Example Request:
Send a POST request to http://localhost:3001/api/sendMessage with the following body:

```bash
{
  "appName": "app",
  "message": "launch app"
}

```

Make sure to include the x-api-key in the request headers if required by your setup.

# Example .http Test File for VSCode REST Client:

```bash
POST http://localhost:3000/api/sendMessage
Content-Type: application/json
x-api-key: your-secret-api-key

{
  "appName": "app",
  "message": "launch app"
}
```

# Project Structure.

```bash
telegram-bot-message-sender/
├── node_modules/      # Installed dependencies
├── .env               # Environment variables
├── index.js           # Main application file
├── package.json       # Project metadata and scripts
├── package-lock.json  # Dependency lock file
├── README.md          # Project documentation
└── middlewares/       # Middleware files
    └── checkApiKey.js  # Middleware for API key validation

```
