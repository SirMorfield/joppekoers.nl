const nodemailer = require('nodemailer')
const OAuth2 = require('googleapis').google.auth.OAuth2
const path = require('path')
const env = require(path.join(process.env.PWD, '/configs/env.json'))

const oauth2Client = new OAuth2(
  env.googleMailer.clientID,
  env.googleMailer.clientSecret,
  'https://developers.google.com/oauthplayground'
)

oauth2Client.setCredentials({
  refresh_token: env.googleMailer.refreshToken
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
      user: env.realEmail,
      clientId: env.googleMailer.clientID,
      clientSecret: env.googleMailer.clientSecret,
      refreshToken: env.googleMailer.refreshToken,
      accessToken: oauth2Client.getAccessToken()
    }
  })

  const mailOptions = {
    from: env.email,
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
        resolve({ error: 'email rejected' })
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
