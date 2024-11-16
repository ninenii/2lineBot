// Import modules
const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('@line/bot-sdk');
const axios = require('axios');

// LINE Bot API config
const config = {
  channelAccessToken: 'UiQb94tyD1whY/1I2iAaVIUSijxvvNqAVjCnJwEZNiO1LEtYqeQBkdmcNL3qSCHDS7JCsDDM3n94o/t/htF0ygUmuD5bzZtyCqpMLFjuxGHaQ/0n0t83Y5DaPAo64ZHX6WKMs+yg4rE76ypEbfMEfAdB04t89/1O/w1cDnyilFU=',
  channelSecret: 'f7e1f9937eca9cc402164890b24b0d3d',
};
const client = new Client(config);

// Set up Express app
const app = express();
app.use(bodyParser.json());

// Function to fetch PM data from ThingSpeak
async function getPMData() {
  try {
    const response = await axios.get('https://api.thingspeak.com/channels/2743926/feeds.json?api_key=X6I9TX4B3MTNCX20&results=1');
    const pm1 = response.data.feeds[0].field1;
    const pm2_5 = response.data.feeds[0].field2;
    const pm10 = response.data.feeds[0].field3;
    return { pm1, pm2_5, pm10 };
  } catch (error) {
    console.error('Error fetching data from ThingSpeak:', error);
    return null;
  }
}

// Webhook endpoint for LINE Bot
app.post('/webhook', async (req, res) => {
  const events = req.body.events;
  for (let event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const message = event.message.text.toLowerCase();
      const replyToken = event.replyToken;

      if (message === 'pm now') {
        const pmData = await getPMData();
        if (pmData) {
          const replyMessage = {
            type: 'text',
            text: `PM1: ${pmData.pm1} ug/m3\nPM2.5: ${pmData.pm2_5} ug/m3\nPM10: ${pmData.pm10} ug/m3`,
          };
          client.replyMessage(replyToken, replyMessage);
        } else {
          const replyMessage = {
            type: 'text',
            text: 'Sorry, I couldn\'t retrieve the PM data at the moment.',
          };
          client.replyMessage(replyToken, replyMessage);
        }
      }
    }
  }
  res.status(200).send('OK');
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
