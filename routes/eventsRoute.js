const express = require("express");


const router = express.Router();

const eventController = require("../controllers/eventsController");
const validatonSchema = require("../middlewares/validationSchmea");

router
  .route("/")
  .get(eventController.getAllEvents)
  .post(validatonSchema(), eventController.addEvent);
router
  .route("/:eventId")
  .get(eventController.getEvent)
  .patch(eventController.updateEvent)
  .delete(eventController.deleteEvent);

module.exports = router;
