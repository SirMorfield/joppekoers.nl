const nodemailer = require('nodemailer')
// const { google } = require('googleapis')
// const OAuth2 = google.auth.OAuth2
const OAuth2 = require('googleapis').google.auth.OAuth2

const auth = require('../../configs/env.json')

console.log(auth)
const oauth2Client = new OAuth2(
  auth.clientID,
  auth.clientSecret,
  'https://developers.google.com/oauthplayground'
)

oauth2Client.setCredentials({
  refresh_token: auth.refreshToken
})

function isValidEmail(email) {
  let regex = /^(([^<>()\[\]\\.,:\s@']+(\.[^<>()\[\]\\.,:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return regex.test(email.toLowerCase())
}

async function sendEmail(to, subject, html) {
  if (!isValidEmail(to)) {
    return { error: 'Invalid email' }
  }

  if (typeof subject !== 'string' || subject.length < 1) {
    return { error: 'Invalid subject' }
  }

  if (typeof html !== 'string' || html.length < 1) {
    return { error: 'Invalid html' }
  }

  const smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: auth.realEmail,
      clientId: auth.clientID,
      clientSecret: auth.clientSecret,
      refreshToken: auth.refreshToken,
      accessToken: oauth2Client.getAccessToken()
    }
  })

  const mailOptions = {
    from: auth.email,
    to: to,
    subject: subject,
    generateTextFromHTML: true,
    html: html
  }

  const exitMsg = await new Promise((resolve, reject) => {
    smtpTransport.sendMail(mailOptions, (err, response) => {
      if (err) {
        resolve({ error: err })
      } else if (response.rejected.length > 0) {
        resolve({ error: 'Email rejected' })
      } else {
        resolve({})
      }
      smtpTransport.close()
    })
  })

  return exitMsg
}


module.exports = {
  isValidEmail,
  sendEmail
}
