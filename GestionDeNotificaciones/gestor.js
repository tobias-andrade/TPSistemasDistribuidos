const sgMail = require('@sendgrid/mail')
sgMail.setApiKey('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')

const msg = {
  to: 'tobiaseltoti5@gmail.com', // Change to your recipient
  from: 'lucianofrangolini2@gmail.com', // Change to your verified sender
  subject: 'Sending with SendGrid is Fun',
  //text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
}

sgMail
  .send(msg)
  .then((response) => {
    console.log(response[0].statusCode)
    console.log(response[0].headers)
  })
  .catch((error) => {
    console.error(error)
  })
