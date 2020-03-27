const express = require("express");
const router = express.Router();
const mailgun = require("mailgun-js");
const User = require("../models/User");

router.post("/contact/more-infos", async (req, res) => {
  const mg = mailgun({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
    host: "api.eu.mailgun.net"
  });
  try {
    const {
      lastName,
      name,
      email,
      tel,
      message,
      artType,
      artName
    } = req.fields;
    const mailName = `${name ? " " : ""}${name ? name : ""}`;
    const users = await User.find({ role: "admin" });
    let usersEmail = "";
    let userResponse = {};
    let adminResponse = {};

    users.forEach((user, index) => {
      if (index === users.length - 1) {
        usersEmail += user.email;
      } else {
        usersEmail += user.email + ", ";
      }
    });

    const dataUser = {
      from: `Gainz Art <contact@gainz-art.com>`,
      to: email,
      subject: "Nous avons bien reçu votre demande. Message well received.",
      html: `Bonjour${mailName},<br><br>Merci de votre intérêt pour le travail de Gainz.<br>Nous avons bien reçu votre demande et reviendrons vers vous dans les plus brefs délais.<br><br>À très bientôt,<br>L'équipe Gainz.<br><br><br><i>Hi${mailName},<br><br>Thanks for your interest in Gainz work.<br>We've well received your message and will get back to you shortly.<br><br>Best,<br>Gainz Team.</i>`
    };
    const dataAdmin = {
      from: `Gainz Art <contact@gainz-art.com>`,
      to: usersEmail,
      subject: "Gainz Art - Nouvelle demande.",
      html: `Salut chouchou,<br><br>Quelqu'un désire obtenir quelques informations.<br><br>La demande porte sur <b>${artName}</b> (${artType})<br><br><b>Détails :</b><br><u>Nom</u> : ${
        lastName ? lastName : "Non renseigné"
      }<br><u>Prénom</u> : ${
        name ? name : "Non renseigné"
      }<br><u>Email</u> : ${email}<br><u>Téléphone</u> : ${
        tel ? tel : "Non renseigné"
      }<br><u>Message</u> : ${message ? message : "Non renseigné"}`
    };
    await mg.messages().send(dataAdmin, (error, body) => {
      console.log({ body, error });
    });
    await mg.messages().send(dataUser, (error, body) => {
      console.log({ body, error });
    });
    res.status(200).json({ message: "Email sent to user and admins." });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
