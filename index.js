const express = require("express");
const formidableMiddleware = require("express-formidable");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(formidableMiddleware());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

const paintingRoutes = require("./routes/painting");
app.use(paintingRoutes);
const paperRoutes = require("./routes/paper");
app.use(paperRoutes);

app.all("*", function(req, res) {
  res.json({ message: "all routes" });
});

app.listen(process.env.PORT, () => {
  console.log("Server has started");
});
