import React from 'react';
import { Icon } from '../common/Icons';

export function Header({
    view, profile, showNotifications, setShowNotifications, unreadCount,
    notifications, mutateNotifs, changeView, showProfileMenu, setShowProfileMenu,
    getImgUrl, axiosInstance, clearSession,
    theme, setTheme
}) {
    return (
        <header className="content-header">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h2>{view === "event_details" ? "Event Details" : view.charAt(0).toUpperCase() + view.slice(1).replace("Mgmt", "Management").replace("_", " ")}</h2>
                {profile && (
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span className={`role-badge role-${profile.role}`}>{profile.role}</span>
                        <span className={`status-badge ${profile.isApproved ? "approved" : "pending"}`}>
                            {profile.isApproved ? "Account Verified" : "Account: Pending Review"}
                        </span>
                    </div>
                )}
            </div>

            {profile && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {/* Notification Bell */}
                    <div style={{ position: 'relative' }}>
                        <button
                            className="theme-toggle"
                            style={{ width: 38, height: 38, position: 'relative', background: showNotifications ? 'var(--accent-soft)' : '' }}
                            onClick={() => { setShowNotifications(v => !v); setShowProfileMenu(false); }}
                        >
                            <Icon.Bell />
                            {unreadCount > 0 && (
                                <span style={{
                                    position: 'absolute', top: 4, right: 4,
                                    background: 'var(--bad)', color: '#fff',
                                    borderRadius: '50%', width: 16, height: 16,
                                    fontSize: '0.65rem', fontWeight: 700,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                            )}
                        </button>

                        {showNotifications && (
                            <div style={{
                                position: 'absolute', right: 0, top: 46, width: 340,
                                background: 'var(--panel)', border: '1px solid var(--border)',
                                borderRadius: 16, boxShadow: 'var(--card-shadow)',
                                zIndex: 3000, overflow: 'hidden', animation: 'rise-in 200ms ease-out'
                            }}>
                                <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <strong style={{ fontSize: '0.9rem' }}>Notifications {unreadCount > 0 && <span style={{ color: 'var(--accent)' }}>({unreadCount})</span>}</strong>
                                    {unreadCount > 0 && (
                                        <button className="btn btn-sm btn-ghost" style={{ marginTop: 0, padding: '4px 10px', fontSize: '0.78rem' }}
                                            onClick={async () => { await axiosInstance.patch('/notifications/read-all'); mutateNotifs(); }}>
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                                <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                                    {notifications.length === 0 ? (
                                        <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.88rem' }}>No notifications yet</div>
                                    ) : notifications.map(n => (
                                        <div key={n._id}
                                            className="notification-item"
                                            onClick={() => {
                                                if (n.link) changeView(n.link);
                                                setShowNotifications(false);
                                            }}
                                            style={{
                                                padding: '14px 18px', borderBottom: '1px solid var(--border)',
                                                cursor: 'pointer', background: n.read ? 'transparent' : 'rgba(79, 126, 248, 0.05)'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: n.read ? 600 : 700, fontSize: '0.88rem', color: n.read ? 'var(--ink)' : 'var(--accent)' }}>{n.title}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.4 }}>{n.message}</div>
                                                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 6, opacity: 0.7 }}>{new Date(n.createdAt).toLocaleString()}</div>
                                                </div>
                                                {!n.read && (
                                                    <button className="theme-toggle" style={{ width: 24, height: 24, opacity: 0.6 }}
                                                        onClick={(e) => { e.stopPropagation(); axiosInstance.patch(`/notifications/${n._id}/read`).then(mutateNotifs); }}>
                                                        <Icon.Check />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile Menu */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <div
                            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                                padding: '6px 12px', borderRadius: 12, transition: 'all 0.2s',
                                background: showProfileMenu ? 'var(--panel-hover)' : 'transparent'
                            }}
                        >
                            <div style={{ textAlign: "right", fontSize: "0.85rem" }}>
                                <div style={{ fontWeight: 700 }}>{profile.firstName}</div>
                            </div>
                            <div className="profile-avatar" style={{ width: 42, height: 42, border: showProfileMenu ? "2px solid var(--accent)" : "2px solid var(--accent-soft)", transition: 'all 0.2s' }}>
                                <img src={getImgUrl(profile.profileImage)} alt="profile" />
                            </div>
                        </div>

                        {showProfileMenu && (
                            <div style={{
                                position: 'absolute', right: 0, top: 56, width: 200,
                                background: 'var(--panel)', border: '1px solid var(--border)',
                                borderRadius: 16, boxShadow: 'var(--card-shadow)',
                                zIndex: 3000, overflow: 'hidden', animation: 'rise-in 150ms ease-out'
                            }}>
                                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--input-bg)' }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{profile.firstName} {profile.lastName}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.email}</div>
                                </div>
                                <div style={{ padding: 6 }}>
                                    <div className="nav-link" onClick={() => { changeView("profile"); setShowProfileMenu(false); }} style={{ padding: '10px 12px' }}>
                                        <Icon.User /> Profile Settings
                                    </div>
                                    <div className="nav-link" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} style={{ padding: '10px 12px' }}>
                                        {theme === "dark" ? <Icon.Sun /> : <Icon.Moon />} {theme === "dark" ? "Light Mode" : "Dark Mode"}
                                    </div>
                                    <div className="nav-link" onClick={() => { clearSession(); setShowProfileMenu(false); }} style={{ padding: '10px 12px', color: 'var(--bad)' }}>
                                        <Icon.Lock /> Logout
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
