require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

const mongoose = require("mongoose");
const httpStatusText = require("./utils/httpStatusText");
const url = process.env.MONGO_URL;

mongoose.connect(url).then(() => {
  console.log("mongodb sever started");
});

app.use(cors());
app.use(express.json());

const eventRouter = require("./routes/eventsRoute");

app.use("/api/events", eventRouter);

// Global Middleware for not found router
app.all("*", (req, res, next) => {
  return res
    .status(404)
    .json({
      status: httpStatusText.ERROR,
      message: "this is resourse is not avilable",
    });
});

// Global error handdler
app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "An unexpected error occurred";
  return res.status(statusCode).json({
    status: error.statusText || httpStatusText.ERROR,
    message: error.message,
    code: error.statusCode || 500,
    data: null
  });
});

app.listen(process.env.PORT || 4000, () => {
  console.log("listen on port 4000");
});
