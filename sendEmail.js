require("dotenv").config();
const { google } = require('googleapis');
const fs = require('fs');

// Initialize the OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob' // redirect uri
);
let sendEmail;
// Check if the token is loaded correctly
fs.readFile('token.json', (err, token) => {
  if (err) {
    return console.error('Error loading token:', err);
  }
  
  const tokenData = JSON.parse(token);
  console.log('Token loaded:', tokenData);
  oAuth2Client.setCredentials(tokenData);

  // Function to send an email
  sendEmail = async (emailAddress, username) =>{
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
  }

  // Test sending an email
});
setTimeout(()=>{
  module.exports = {
    sendEmail
  };}
, 1000)
