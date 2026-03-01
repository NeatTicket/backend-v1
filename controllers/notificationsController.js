const Notification = require("../models/Notification");
const asyncWrapper = require("../middlewares/asyncWrapper");
const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");

// GET /notifications  — current user's notifications (newest first)
const getMyNotifications = asyncWrapper(async (req, res) => {
    const notifications = await Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50);

    const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });

    res.json({ status: httpStatusText.SUCCESS, data: { notifications, unreadCount } });
});

// PATCH /notifications/:id/read
const markRead = asyncWrapper(async (req, res, next) => {
    const n = await Notification.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { read: true },
        { new: true }
    );
    if (!n) return next(new AppError("Notification not found", 404, httpStatusText.FAIL));
    res.json({ status: httpStatusText.SUCCESS, data: { notification: n } });
});

// PATCH /notifications/read-all
const markAllRead = asyncWrapper(async (req, res) => {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ status: httpStatusText.SUCCESS, data: null, message: "All notifications marked as read" });
});

// DELETE /notifications/:id
const deleteNotification = asyncWrapper(async (req, res, next) => {
    const n = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!n) return next(new AppError("Notification not found", 404, httpStatusText.FAIL));
    res.json({ status: httpStatusText.SUCCESS, data: null });
});

module.exports = { getMyNotifications, markRead, markAllRead, deleteNotification };
