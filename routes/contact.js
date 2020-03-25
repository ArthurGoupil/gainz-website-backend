const express = require("express");
const router = express.Router();
let mailgun = require("mailgun-js")({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});

router.post("contact/more-infos", (req, res) => {
  try {
    const { lastName, name, email, tel, message } = req.fields;
    const data = {
      from: "Excited User <me@samples.mailgun.org>",
      to: "arthurgoupil@gmail.com",
      subject: "Hello",
      text: "Testing some Mailgun awesomeness!"
    };
    mailgun.messages().send(data, (error, body) => {
      res.status(200).json({ message: "Email has been sent." });
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
