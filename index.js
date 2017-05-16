// Packages and config information we will need for the Alexa skill.
const config = require('./config/config.json');
const request = require('request');
const Promise = require('bluebird');

// Set the options for the Google API request.
const options = {
  url: `https://www.googleapis.com/youtube/v3/channels?part=statistics&forUsername=${config.username}&key=${config.api_key}`,
  method: 'GET',
};

// Handler for the AWS Lambda function to call.
exports.handler = (event, context, callback) => {
  // The intent that is being initiated.
  const intentName = event.request.intent.name;

  // Create a new promise to handle the request into Google's API
  // Parse the statistics for your channel from the config.
  new Promise((resolve, reject) => {
    // Send the request to the Google API.
    request(options, (err, res, data) => {
      if (err) {
        reject(err);
        return;
      }

      let statistics = data;

      statistics = JSON.parse(statistics);
      statistics = statistics.items;
      statistics = statistics[0].statistics;

      resolve({
        view_count: statistics.viewCount,
        subscriber_count: statistics.subscriberCount,
        video_count: statistics.videoCount,
      });
    });
  }).then((statistics) => {
    let text = '';

    // Check to see which intent has been called.
    switch (intentName) {
      case 'SubscriberIntent':
        text = `You have ${statistics.subscriber_count} subscribers`;
        break;
      case 'ViewCountIntent':
        text = `Your channel has ${statistics.view_count} views`;
        break;
      case 'VideoIntent':
        text = `You have ${statistics.video_count} videos uploaded`;
        break;
      default:
        text = 'I could not find the information you were asking for.';
    }

    // Generate the JSON needed for the callback to Alexa.
    callback(null, {
      version: '1.0',
      sessionAttributes: {},
      response: {
        outputSpeech: {
          type: 'PlainText',
          text,
        },
        card: {
          type: 'Simple',
          title: text,
          content: text,
        },
        shouldEndSession: true,
      },
    });
  });
};
