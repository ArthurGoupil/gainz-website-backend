const express = require("express");
const router = express.Router();
let mailgun = require("mailgun-js")({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});

router.post("/contact/more-infos", (req, res) => {
  try {
    const { lastName, name, email, tel, message } = req.fields;
    const mailName = `${name || lastName ? " " : ""}${name ? name : ""}${
      lastName ? lastName : ""
    }`;
    const data = {
      from: `Gainz Art <me@${process.env.MAILGUN_DOMAIN}>`,
      to: `arthurgoupil@gmail.com`,
      subject: "Nous avons bien reçu votre demande. Message well received.",
      text: `Bonjour${mailName},\n\nMerci de votre intérêt pour le travail de Gainz.\nNous avons bien reçu votre demande et reviendrons vers vous dans les plus brefs délais.\n\nÀ très bientôt,\nL'équipe Gainz.\n\n\nHi${mailName},\n\nThanks for your interest in Gainz work.\nWe've well received your message and will get back to you shortly.\n\nBest,\nGainz Team.`
    };
    mailgun.messages().send(data, (error, body) => {
      res.status(200).json({ message: "body : " + body + "error : " + error });
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
