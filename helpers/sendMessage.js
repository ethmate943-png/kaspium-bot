// Function to send a message
const sendMessage = async (url, body) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Failed to send message to ${url}`);
  }
  return response.json();
};

module.exports = sendMessage;
