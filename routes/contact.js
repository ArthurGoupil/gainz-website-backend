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
      to: email,
      subject: "Nous avons bien reçu votre demande. Message well received.",
      html: `<img
      src="https://apicms.thestar.com.my/uploads/images/2020/02/27/578706.jpg"
      alt="cat"
      style="width:200px;"
    /><br><b>Bonjour</b>${mailName},<br><br>Merci de votre intérêt pour le travail de Gainz.<br>Nous avons bien reçu votre demande et reviendrons vers vous dans les plus brefs délais.<br><br>À très bientôt,<br>L'équipe Gainz.<br><br><br><i>Hi${mailName},<br><br>Thanks for your interest in Gainz work.<br>We've well received your message and will get back to you shortly.<br><br>Best,<br>Gainz Team.</i>`
    };
    mailgun.messages().send(data, (error, body) => {
      res.status(200).json({ body, error });
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
