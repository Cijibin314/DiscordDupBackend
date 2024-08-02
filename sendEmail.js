const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Load the token from the token file
const TOKEN_PATH = path.join(__dirname, 'token.json');
const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));

// Your credentials from the Google Cloud Console


// Create OAuth2 client
const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
oAuth2Client.setCredentials(token);

// Function to send an email
async function sendEmail(emailAdress, username) {
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  const emailLines = [
    'From: "Sender Name" discorddupemail82194835y726@gmail.com',
    `To: ${emailAdress}`,
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
    console.log('Email sent:');
    return true
  } catch (error) {
    console.error('Error sending email:', error);
    return "Error sending email"
  }
}

module.exports = {
  sendEmail
}