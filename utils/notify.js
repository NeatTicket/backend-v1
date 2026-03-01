/**
 * Utility to create a notification for a user.
 * Always safe to call — errors are swallowed so they never break the main flow.
 */
const Notification = require("../models/Notification");

const notify = async ({ userId, type, title, message, link }) => {
    try {
        await Notification.create({ user: userId, type, title, message, link });
    } catch (err) {
        console.error("[notify] Failed to create notification:", err.message);
    }
};

module.exports = notify;
