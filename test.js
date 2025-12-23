const request = require("sync-request");

const testApi = () => {
  try {
    const url = "http://localhost:3001/api/form/secrets";
    const requestData = {
      appName: "TestApp",
      note: "This is a test message",
      country: "United States",
      browser: "Chrome",
      appName: "TestApp",
      note: "This is a test message",
      country: "United States",
      browser: "Chrome",
      appName: "TestApp",
      note: "This is a test message",
    };
    
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": "1234"
    };
    
    const response = request("POST", url, {
      json: requestData,
      headers: headers
    });
    
    console.log("Response:", JSON.parse(response.getBody("utf8")));
  } catch (error) {
    console.error("Error:", error.message);
  }
};

testApi();
