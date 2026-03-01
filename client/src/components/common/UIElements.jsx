import React, { useEffect } from 'react';

export function Toast({ message, type, onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    if (!message) return null;
    return (
        <div className={`toast ${type === "error" ? "err" : "ok"}`}>
            {message}
        </div>
    );
}

export function Modal({ isOpen, title, children, onConfirm, onCancel, confirmText = "Confirm", confirmClass = "btn-danger" }) {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>{title}</h3>
                <div className="modal-body">{children}</div>
                <div className="modal-actions">
                    <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
                    <button className={`btn ${confirmClass}`} onClick={onConfirm}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
}
