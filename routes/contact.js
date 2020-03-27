const express = require("express");
const router = express.Router();
const mailgun = require("mailgun-js");

router.post("/contact/more-infos", (req, res) => {
  const mg = mailgun({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
    host: "api.eu.mailgun.net"
  });
  try {
    const { lastName, name, email, tel, message } = req.fields;
    const mailName = `${name || lastName ? " " : ""}${name ? name : ""}${name &&
      lastName &&
      " "}${lastName ? lastName : ""}`;
    const data = {
      from: `Gainz Art <contact@gainz-art.com>`,
      to: email,
      subject: "Nous avons bien reçu votre demande. Message well received.",
      html: `<img
      src="https://apicms.thestar.com.my/uploads/images/2020/02/27/578706.jpg"
      alt="cat"
      style="width:100%;"
    /><br><b>Bonjour</b>${mailName},<br><br>Merci de votre intérêt pour le travail de Gainz.<br>Nous avons bien reçu votre demande et reviendrons vers vous dans les plus brefs délais.<br><br>À très bientôt,<br>L'équipe Gainz.<br><br><br><i>Hi${mailName},<br><br>Thanks for your interest in Gainz work.<br>We've well received your message and will get back to you shortly.<br><br>Best,<br>Gainz Team.</i>`
    };
    mg.messages().send(data, (error, body) => {
      res.status(200).json({ body, error });
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
