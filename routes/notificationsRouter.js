const express = require("express");
const { protect } = require("../middlewares/protect");
const { getMyNotifications, markRead, markAllRead, deleteNotification } = require("../controllers/notificationsController");
const router = express.Router();

router.get("/", protect, getMyNotifications);
router.patch("/read-all", protect, markAllRead);
router.patch("/:id/read", protect, markRead);
router.delete("/:id", protect, deleteNotification);

module.exports = router;
