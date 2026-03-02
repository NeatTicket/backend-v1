import React from 'react';
import { Icon } from '../common/Icons';

export function Sidebar({ view, changeView, profile, authHeadersExist, clearSession, isSidebarOpen, toggleSidebar }) {
    const go = (target) => changeView(target);

    return (
        <aside className={`sidebar ${isSidebarOpen ? "is-open" : "is-mini"}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo" onClick={() => go("overview")} style={{ cursor: "pointer", paddingBottom: 0 }}>
                    {isSidebarOpen && <h1 className="brand-name">NeatTicket</h1>}
                </div>
                <button className="theme-toggle sidebar-toggle-btn" onClick={toggleSidebar} aria-label="Toggle sidebar menu">
                    {isSidebarOpen ? <Icon.X /> : <Icon.Menu />}
                </button>
            </div>

            {isSidebarOpen && (
                <nav className="nav-links">
                    <div className={`nav-link ${view === "overview" ? "active" : ""}`} onClick={() => go("overview")}><Icon.Home /> Dashboard</div>
                    <div className={`nav-link ${view === "events" ? "active" : ""}`} onClick={() => go("events")}><Icon.Compass /> Discover Events</div>
                    <div className={`nav-link ${view === "places" ? "active" : ""}`} onClick={() => go("places")}><Icon.Map /> Discover Venues</div>

                    {authHeadersExist && profile?.role === "admin" && (
                        <>
                            <div style={{ margin: "10px 0 5px", padding: "0 14px", fontSize: "0.7rem", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", opacity: 0.6 }}>Administration</div>
                            <div className={`nav-link ${view === "users" ? "active" : ""}`} onClick={() => go("users")}><Icon.Shield /> Provider Review</div>
                            <div className={`nav-link ${view === "admin_users" ? "active" : ""}`} onClick={() => go("admin_users")}><Icon.User /> Regular Users</div>
                            <div className={`nav-link ${view === "admin_venues" ? "active" : ""}`} onClick={() => go("admin_venues")}><Icon.Map /> Global Venues</div>
                            <div className={`nav-link ${view === "admin_events" ? "active" : ""}`} onClick={() => go("admin_events")}><Icon.Event /> Global Events</div>
                        </>
                    )}

                    {authHeadersExist && (profile?.role === "place_owner" || profile?.role === "admin") && (
                        <div className={`nav-link ${view === "my_venues" ? "active" : ""}`} onClick={() => go("my_venues")}><Icon.Place /> My Venues</div>
                    )}

                    {authHeadersExist && (profile?.role === "event_organizer" || profile?.role === "admin") && (
                        <div className={`nav-link ${view === "my_events" ? "active" : ""}`} onClick={() => go("my_events")}><Icon.Event /> My Events</div>
                    )}

                    {authHeadersExist && <div className={`nav-link ${view === "tickets" ? "active" : ""}`} onClick={() => go("tickets")}><Icon.Ticket /> My Tickets</div>}


                    {authHeadersExist && (
                        <div className={`nav-link ${view === "profile" ? "active" : ""}`} onClick={() => go("profile")} style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                            Account Settings
                        </div>
                    )}

                    <div style={{ margin: "20px 0 10px", padding: "0 14px", fontSize: "0.75rem", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>Accounts</div>

                    {!authHeadersExist ? (
                        <>
                            <div className={`nav-link ${view === "login" ? "active" : ""}`} onClick={() => go("login")}><Icon.Lock /> Login</div>
                            <div className={`nav-link ${view === "register" ? "active" : ""}`} onClick={() => go("register")}><Icon.Plus /> Register</div>
                        </>
                    ) : (
                        <div className="nav-link" onClick={clearSession} style={{ color: 'var(--bad)' }}><Icon.Lock /> Logout</div>
                    )}
                </nav>
            )}
        </aside>
    );
}
