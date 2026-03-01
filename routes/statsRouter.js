const express = require("express");
const { protect } = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");
const { getOverviewStats, getPublicStats } = require("../controllers/statsController");

const router = express.Router();

router.get("/overview", protect, authorize(["admin"]), getOverviewStats);
router.get("/public", getPublicStats);

module.exports = router;

