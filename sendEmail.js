require("dotenv").config();
const { google } = require('googleapis');
const fs = require('fs').promises; // Use promises API for fs

// Initialize the OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob'
);


// Function to load the token and initialize sendEmail
let token;
let tokenData;
async function init(){
  token = await fs.readFile('token.json', 'utf8');
  tokenData = JSON.parse(token);
  console.log('Token loaded:', tokenData);
  oAuth2Client.setCredentials(tokenData);
  console.log("Done")
}
// Define sendEmail function
init()
async function sendEmail(emailAddress, username){
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  const emailLines = [
    'From: "Sender Name" <discorddupemail82194835y726@gmail.com>',
    `To: ${emailAddress}`,
    'Subject: Password Reset of Discord Duplicate',
    '',
    `Link to your password reset: https://cijibin314.github.io/DiscordDupPasswordReset?username=${username}`
  ];

  const email = emailLines.join('\n');

  const encodedMessage = Buffer.from(email)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });
    console.log('Email sent:', res.data);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return "Error sending email";
  }
};

// Initialize the client and export sendEmail when ready

module.exports = {
  sendEmail
};
