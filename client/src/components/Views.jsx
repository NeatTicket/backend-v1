import React, { useState, useMemo } from 'react';
import QRCode from "react-qr-code";
import useSWR from 'swr';
import axiosInstance from '../lib/axios';
import { Icon } from './common/Icons';
import { VenueCard, EventCard } from './common/Cards';

export function Overview({ profile, stats, publicStats, authHeadersExist, changeView, places, getImgUrl, setSelectedPlace }) {
    return (
        <div className="animate-fade-in">
            <div className="panel accent-panel">
                <h3>{profile?.role === "admin" ? "Management Dashboard" : "Welcome to NeatTicket"}</h3>
                <p style={{ marginTop: 8, opacity: 0.9 }}>{profile?.role === "admin" ? "Monitor system growth and approve providers." : "Discover the best events and venues in your city."}</p>
            </div>
            <div className="grid">
                {profile?.role === "admin" ? (
                    [["Users", stats?.users], ["Approved", stats?.approvedUsers], ["Places", stats?.places], ["Events", stats?.events], ["Upcoming", stats?.upcomingEvents], ["Sales", stats?.tickets]].map(([l, v]) => <div className="stat-card" key={l}><div className="stat-num">{v ?? 0}</div><div className="stat-label">{l}</div></div>)
                ) : [["Events", publicStats?.events], ["Live", publicStats?.upcomingEvents], ["Venues", publicStats?.places]].map(([l, v]) => <div className="stat-card" key={l}><div className="stat-num">{v ?? 0}</div><div className="stat-label">{l}</div></div>)}
            </div>

            {!authHeadersExist && (
                <div style={{ marginTop: 60 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Featured Venues</h2>
                        <button className="btn btn-sm btn-ghost" onClick={() => changeView("places")}>View All <Icon.ArrowRight /></button>
                    </div>
                    <div className="grid">
                        {places.slice(0, 2).map(p => (
                            <VenueCard key={p._id} p={p} profile={profile} getImgUrl={getImgUrl} onSelect={() => setSelectedPlace(p)} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export function LoginView({ loginForm, setLoginForm, onLogin, changeView }) {
    return (
        <div className="auth-container animate-fade-in">
            <div className="panel auth-card" style={{ maxWidth: 420, margin: '40px auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    <div className="logo-box" style={{ margin: '0 auto 16px', width: 48, height: 48 }}><Icon.Logo /></div>
                    <h2>Welcome Back</h2>
                    <p style={{ color: 'var(--muted)', marginTop: 8 }}>Sign in to continue to NeatTicket</p>
                </div>
                <div className="form-group">
                    <label>Email Address</label>
                    <input placeholder="name@example.com" value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input type="password" placeholder="••••••••" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
                </div>
                <button className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: 10 }} onClick={onLogin}>Sign In</button>
                <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.9rem', color: 'var(--muted)' }}>
                    Don't have an account? <span style={{ color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }} onClick={() => changeView("register")}>Register now</span>
                </div>
            </div>
        </div>
    );
}

export function EventDetailsView({ eventId, profile, getImgUrl, onBook, onShare, onEdit, onDelete, changeView }) {
    const fetcher = (url) => axiosInstance.get(url).then(res => res.data.data);
    const { data, error, isLoading } = useSWR(eventId ? `/events/${eventId}` : null, fetcher);
    const event = data?.event;
    const [currentImage, setCurrentImage] = useState(null);

    React.useEffect(() => {
        if (event && event.images?.length > 0) setCurrentImage(event.images[0]);
    }, [event]);

    if (isLoading) return <div className="panel" style={{ textAlign: 'center', padding: '100px 0' }}>Loading event details...</div>;
    if (error || !event) return (
        <div className="panel" style={{ textAlign: 'center', padding: '100px 0' }}>
            <h3 style={{ color: 'var(--bad)' }}>Event Not Found</h3>
            <p style={{ color: 'var(--muted)', marginTop: 12 }}>The event you are looking for does not exist or has been removed.</p>
            <button className="btn btn-sm btn-ghost" style={{ marginTop: 24 }} onClick={() => changeView("events")}>Go back to events</button>
        </div>
    );

    const isAdmin = profile?.role === "admin";
    const organizerId = event.organizer?._id || event.organizer;
    const isOrganizer = profile?._id && organizerId && organizerId.toString() === profile._id.toString();
    const canManage = profile && (isAdmin || isOrganizer);

    return (
        <div className="animate-fade-in" style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 60 }}>
            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <button className="btn btn-sm btn-ghost" onClick={() => changeView("events")}>
                    <Icon.ArrowRight style={{ transform: 'rotate(180deg)', width: 14, height: 14, marginRight: 8 }} /> Back to Events
                </button>

                <div style={{ display: 'flex', gap: 12 }}>
                    <button
                        className="btn btn-primary"
                        style={{
                            height: 48,
                            padding: '0 28px',
                            borderRadius: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            fontSize: '0.95rem',
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, var(--accent) 0%, #7c3aed 100%)',
                            border: 'none',
                            boxShadow: '0 10px 20px rgba(124, 58, 237, 0.3)',
                            color: '#fff',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                        onClick={() => onShare(event)}
                    >
                        <Icon.Share style={{ width: 18, height: 18, strokeWidth: 2.5 }} /> Share Event
                    </button>
                    {canManage && (
                        <>
                            <button className="btn btn-sm btn-ghost" style={{ height: 40, borderRadius: 12, border: '1px solid var(--border)' }} onClick={() => onEdit?.(event)}>
                                <Icon.Edit style={{ width: 14, height: 14, marginRight: 6 }} /> Edit
                            </button>
                            <button className="btn btn-sm btn-ghost" style={{ height: 40, borderRadius: 12, border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--bad)' }} onClick={() => onDelete?.(event._id)}>
                                <Icon.Trash style={{ width: 14, height: 14, marginRight: 6 }} /> Delete
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: 32, alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    {/* Visual Stage */}
                    <div style={{ position: 'relative', height: 480, borderRadius: 28, overflow: 'hidden', background: 'var(--input-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                        {currentImage ? (
                            <img src={getImgUrl(currentImage)} alt={event.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ textAlign: 'center', opacity: 0.2 }}>
                                <Icon.Event style={{ width: 120, height: 120, marginBottom: 16 }} />
                                <div style={{ fontWeight: 600 }}>No Gallery Photos</div>
                            </div>
                        )}

                        {event.images?.length > 1 && (
                            <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 12, background: 'rgba(0,0,0,0.4)', padding: '12px 16px', borderRadius: 24, backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', zIndex: 10 }}>
                                {event.images.map((img, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setCurrentImage(img)}
                                        style={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: 12,
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            border: currentImage === img ? '3px solid var(--accent)' : '3px solid transparent',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            transform: currentImage === img ? 'scale(1.15) translateY(-4px)' : 'scale(1)',
                                            boxShadow: currentImage === img ? '0 8px 16px rgba(0,0,0,0.3)' : 'none'
                                        }}
                                    >
                                        <img src={getImgUrl(img)} alt={`thumb-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="panel" style={{ padding: 40, borderRadius: 28 }}>
                        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 16, lineHeight: 1.2 }}>{event.name}</h2>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
                            {canManage && event.status !== 'approved' && (
                                <span className={`status-badge ${event.status}`} style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{event.status}</span>
                            )}
                            {event.place ? (
                                <span className="status-badge approved" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>VERIFIED VENUE</span>
                            ) : (
                                <span className="status-badge pending" style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--muted)' }}>PUBLIC LOCATION</span>
                            )}
                        </div>

                        <h3 style={{ fontSize: '1.2rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 4, height: 24, background: 'var(--accent)', borderRadius: 2 }}></div>
                            About this Event
                        </h3>
                        <div style={{ lineHeight: 1.8, fontSize: '1.1rem', color: 'var(--ink)', opacity: 0.9, whiteSpace: 'pre-wrap' }}>
                            {event.description}
                        </div>
                    </div>
                </div>

                {/* Info Sidebar */}
                <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="panel" style={{ padding: 32, borderRadius: 28, background: 'var(--accent)', color: '#fff', border: 'none', boxShadow: '0 20px 40px var(--accent-soft)' }}>
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Date & Time</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Icon.Event style={{ width: 20, height: 20 }} />
                                {new Date(event.date).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}
                            </div>
                        </div>

                        <div style={{ marginBottom: 32 }}>
                            <div style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Location</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Icon.Place style={{ width: 20, height: 20 }} />
                                {event.displayLocation || event.locationName}
                            </div>
                        </div>

                        {event.status === 'approved' ? (
                            <button className="btn" style={{ width: '100%', padding: '16px', background: '#fff', color: 'var(--accent)', fontWeight: 800, fontSize: '1rem', borderRadius: 16, boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }} onClick={() => onBook?.(event._id)}>
                                Book Ticket Now
                            </button>
                        ) : (
                            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 12, fontSize: '0.9rem', fontWeight: 600 }}>
                                Registration Pending
                            </div>
                        )}

                        <div style={{ textAlign: 'center', marginTop: 16, fontSize: '0.8rem', opacity: 0.8 }}>
                            {event.ticketsSold} / {event.maxTickets} Tickets Sold
                        </div>
                    </div>

                    {event.place && (
                        <div className="panel" style={{ padding: 24, borderRadius: 28 }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 16, letterSpacing: '0.05em' }}>Venue Hub</div>
                            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                <div style={{ width: 64, height: 64, borderRadius: 16, overflow: 'hidden', background: 'var(--input-bg)' }}>
                                    <img src={getImgUrl(event.place.images?.[0] || event.place.image)} alt="venue" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: 0, fontSize: '1rem' }}>{event.place.name}</h4>
                                    <p style={{ margin: '4px 0', fontSize: '0.8rem', color: 'var(--muted)' }}>{event.place.location}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="panel" style={{ padding: 24, borderRadius: 28 }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 16, letterSpacing: '0.05em' }}>Organizer</div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, border: '2px solid var(--border)' }}>
                                {event.organizer?.profileImage ? (
                                    <img src={getImgUrl(event.organizer.profileImage)} alt="host" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <>{event.organizer?.firstName?.[0]}{event.organizer?.lastName?.[0]}</>
                                )}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{event.organizer?.firstName} {event.organizer?.lastName}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Event Host</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function RegisterView({ registerForm, setRegisterForm, onRegister, changeView, formErrors }) {
    return (
        <div className="auth-container animate-fade-in">
            <div className="panel auth-card" style={{ maxWidth: 480, margin: '40px auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    <h2>Create Account</h2>
                    <p style={{ color: 'var(--muted)', marginTop: 8 }}>Join the community today</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                        <label>First Name</label>
                        <input placeholder="John" value={registerForm.firstName} onChange={e => setRegisterForm({ ...registerForm, firstName: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Last Name</label>
                        <input placeholder="Doe" value={registerForm.lastName} onChange={e => setRegisterForm({ ...registerForm, lastName: e.target.value })} />
                    </div>
                </div>
                <div className="form-group">
                    <label>Email Address</label>
                    <input placeholder="name@example.com" value={registerForm.email} onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" placeholder="••••••••" value={registerForm.password} onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })} style={{ borderColor: formErrors.password ? 'var(--bad)' : '' }} />
                    </div>
                    <div className="form-group">
                        <label>Confirm</label>
                        <input type="password" placeholder="••••••••" value={registerForm.confirmPassword} onChange={e => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })} style={{ borderColor: formErrors.confirmPassword ? 'var(--bad)' : '' }} />
                    </div>
                </div>
                <div className="form-group">
                    <label>I am a...</label>
                    <select value={registerForm.role} onChange={e => setRegisterForm({ ...registerForm, role: e.target.value })}>
                        <option value="user">Event Attendee</option>
                        <option value="event_organizer">Event Organizer</option>
                        <option value="place_owner">Venue Owner</option>
                    </select>
                </div>
                <button className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: 10 }} onClick={onRegister}>Create Account</button>
                <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.9rem', color: 'var(--muted)' }}>
                    Already have an account? <span style={{ color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }} onClick={() => changeView("login")}>Sign In</span>
                </div>
            </div>
        </div>
    );
}

export function TicketsView({ tickets, getTicketStatusBadge, getImgUrl, useTicketAction, onDelete }) {
    const [filter, setFilter] = useState("all"); // all, upcoming, past
    const [sortBy, setSortBy] = useState("date_desc"); // date_desc, date_asc, title

    const filteredTickets = React.useMemo(() => {
        let result = [...tickets];

        // Filtering
        if (filter === "upcoming") {
            result = result.filter(t => new Date(t.event?.date) >= new Date());
        } else if (filter === "past") {
            result = result.filter(t => new Date(t.event?.date) < new Date());
        }

        // Sorting
        result.sort((a, b) => {
            if (sortBy === "date_desc") return new Date(b.event?.date) - new Date(a.event?.date);
            if (sortBy === "date_asc") return new Date(a.event?.date) - new Date(b.event?.date);
            if (sortBy === "title") return (a.event?.name || "").localeCompare(b.event?.name || "");
            return 0;
        });

        return result;
    }, [tickets, filter, sortBy]);

    if (tickets.length === 0) return (
        <div className="panel animate-fade-in" style={{ textAlign: 'center', padding: '100px 60px' }}>
            <div className="logo-box" style={{ margin: '0 auto 24px', opacity: 0.15, width: 80, height: 80 }}><Icon.Ticket style={{ width: 80, height: 80 }} /></div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>No tickets found</h3>
            <p style={{ color: 'var(--muted)', marginTop: 12, maxWidth: 300, margin: '12px auto 0' }}>You haven't purchased any tickets yet. Explore events to get started!</p>
        </div>
    );

    const downloadQRCode = (ticketId, eventName) => {
        const svg = document.getElementById(`qr-${ticketId}`);
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = `ticket-${eventName.replace(/\s+/g, '-').toLowerCase()}-${ticketId.slice(-4)}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    };

    return (
        <div className="animate-fade-in">
            <div className="panel" style={{ marginBottom: 24, padding: '12px 20px', display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Filter</span>
                    <div className="tab-group" style={{ display: 'flex', background: 'var(--input-bg)', padding: 3, borderRadius: 10, border: '1px solid var(--border)' }}>
                        {['all', 'upcoming', 'past'].map(f => (
                            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : ''}`}
                                style={{ border: 'none', background: filter === f ? 'var(--accent)' : 'transparent', color: filter === f ? '#fff' : 'var(--muted)', height: 28, fontSize: '0.78rem', borderRadius: 7, padding: '0 12px', textTransform: 'capitalize' }}
                                onClick={() => setFilter(f)}>{f}</button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Sort By</span>
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ marginBottom: 0, padding: '4px 12px', height: 34, width: 'auto', fontSize: '0.85rem' }}>
                        <option value="date_desc">Newest First</option>
                        <option value="date_asc">Oldest First</option>
                        <option value="title">Event Name</option>
                    </select>
                </div>
            </div>

            <div className="grid">
                {filteredTickets.map(t => (
                    <div key={t._id} className="panel ticket-card" style={{ display: 'flex', gap: 0, padding: 0, overflow: 'hidden', border: '1px solid var(--border)', transition: 'transform 0.2s' }}>
                        <div style={{ width: 140, background: 'var(--input-bg)', position: 'relative' }}>
                            <img src={getImgUrl(t.event?.place?.images?.[0] || t.event?.place?.image)} alt="event" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button className="theme-toggle" style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(239, 68, 68, 0.9)', color: '#fff', width: 28, height: 28, border: 'none' }}
                                onClick={(e) => { e.stopPropagation(); onDelete(t._id); }}>
                                <Icon.Trash />
                            </button>
                        </div>
                        <div style={{ flex: 1, padding: '20px', borderRight: '2px dashed var(--border)', position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{t.event?.name}</h3>
                                {getTicketStatusBadge(t.status)}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>📅 {new Date(t.event?.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>📍 {t.event?.displayLocation?.slice(0, 30)}...</div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12 }}>
                                <div style={{ fontSize: '0.72rem', color: 'var(--muted)', lineHeight: 1.2 }}>
                                    Ticket ID: <strong style={{ color: 'var(--ink)' }}>{t.uniqueCode || t._id.slice(-8).toUpperCase()}</strong>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button className="btn btn-sm btn-ghost" style={{ fontSize: '0.7rem', height: 'auto', padding: '6px 12px', border: '1px solid var(--accent)', color: 'var(--accent)' }} onClick={() => downloadQRCode(t._id, t.event?.name)}>Save QR</button>
                                    {t.status === "active" && (
                                        <button className="btn btn-sm btn-primary" onClick={() => useTicketAction(t._id)} style={{ padding: '6px 14px' }}>Check-In</button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div style={{ width: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: 10 }}>
                            <QRCode id={`qr-${t._id}`} value={t.uniqueCode || t._id} size={70} level="H" />
                        </div>
                    </div>
                ))}
            </div>

            {filteredTickets.length === 0 && tickets.length > 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
                    No tickets match your current filters.
                </div>
            )}
        </div>
    );
}

export function MyVenuesView({ profile, places, editingPlaceId, setEditingPlaceId, placeForm, setPlaceForm, onSave, onStartEdit, onDelete, onSelect, setRejectModal, setRejectReason, updatePlaceStatus, run, initialPlace, getImgUrl }) {
    return (
        <div className="animate-fade-in">
            {(!profile?.isApproved && profile?.role !== "admin") && (
                <div className="panel accent-panel" style={{ borderStyle: 'dashed', marginBottom: 20 }}>
                    <h4>🔒 Account Awaiting Approval</h4>
                    <p style={{ fontSize: '0.9rem', marginTop: 8 }}>Your venue owner account is currently being reviewed. You will be able to create new venues once approved.</p>
                </div>
            )}

            {profile?.role === "admin" && places.filter(p => p.status === "pending").length > 0 && (
                <div style={{ marginBottom: 40 }}>
                    <h3 style={{ marginBottom: 16 }}>Venue Approval Queue ({places.filter(p => p.status === "pending").length})</h3>
                    <div className="grid">
                        {places.filter(p => p.status === "pending").map(p => (
                            <div key={p._id} className="panel highlight-panel" style={{ display: 'flex', flexDirection: 'column', borderStyle: 'dashed' }}>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: 0 }}>{p.name}</h4>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Loc: {p.location} • Owner: {p.owner?.firstName}</div>
                                </div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                                    <button className="btn btn-sm btn-primary" onClick={() => run(() => updatePlaceStatus(p._id, "approved"))}>Approve</button>
                                    <button className="btn btn-sm btn-ghost" onClick={() => { setRejectModal({ isOpen: true, id: p._id, type: "place" }); setRejectReason(""); }}>Reject</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {(profile?.role === "admin" || (profile?.role === "place_owner" && profile?.isApproved)) && (
                <section className="panel" style={{ maxWidth: 500, marginBottom: 40 }}>
                    <h3>{editingPlaceId ? "Update Venue" : "List New Venue"}</h3>
                    <input placeholder="Venue Name" value={placeForm.name} onChange={e => setPlaceForm({ ...placeForm, name: e.target.value })} />
                    <input placeholder="Location" value={placeForm.location} onChange={e => setPlaceForm({ ...placeForm, location: e.target.value })} />
                    <input type="number" placeholder="Capacity" value={placeForm.capacity} onChange={e => setPlaceForm({ ...placeForm, capacity: e.target.value })} />
                    <textarea placeholder="Description..." value={placeForm.description} onChange={e => setPlaceForm({ ...placeForm, description: e.target.value })} style={{ width: '100%', marginTop: 12, background: 'var(--input-bg)', color: 'var(--ink)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px' }} rows={4} />
                    <label className="btn btn-sm btn-ghost" style={{ display: 'block', textAlign: 'center', marginTop: 12, cursor: 'pointer' }}>
                        {placeForm.imageFiles?.length > 0 ? `✓ ${placeForm.imageFiles.length} Photos selected` : "Upload Venue Photos"}
                        <input type="file" hidden multiple accept="image/*" onChange={e => setPlaceForm({ ...placeForm, imageFiles: Array.from(e.target.files) })} />
                    </label>
                    <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={onSave}>{editingPlaceId ? "Save Changes" : "Create Venue"}</button>
                        {editingPlaceId && <button className="btn btn-ghost" onClick={() => { setEditingPlaceId(null); setPlaceForm(initialPlace); }}>Cancel</button>}
                    </div>
                </section>
            )}

            <h3 style={{ marginBottom: 16 }}>Your Venues</h3>
            <div className="grid">
                {places.filter(p => p.owner?._id === profile?._id).map(p => (
                    <VenueCard key={p._id} p={p} profile={profile} getImgUrl={getImgUrl} onEdit={() => onStartEdit(p)} onDelete={() => onDelete(p._id)} onSelect={() => onSelect(p)} />
                ))}
            </div>
        </div>
    );
}

export function MyEventsView({ profile, events, places, editingEventId, setEditingEventId, eventForm, setEventForm, onSave, onStartEdit, onDelete, onApprove, onShare, onViewDetails, setRejectModal, setRejectReason, run, initialEvent, loadAvailability, getImgUrl }) {
    const isAdmin = profile?.role === "admin";

    return (
        <div className="animate-fade-in">
            {profile?.role === "admin" && (
                <div style={{ marginBottom: 40 }}>
                    <h3 style={{ marginBottom: 16 }}>Waiting for Global Review (Public Locations)</h3>
                    <div className="grid">
                        {events.filter(ev => ev.status === "pending" && !ev.place).length > 0 ? (
                            events.filter(ev => ev.status === "pending" && !ev.place).map(ev => (
                                <div key={ev._id} className="panel highlight-panel">
                                    <h4 style={{ margin: 0 }}>{ev.name}</h4>
                                    <div style={{ fontSize: "0.82rem", color: "var(--accent)" }}>{ev.displayLocation}</div>
                                    <div style={{ display: "flex", gap: "8px", marginTop: 12 }}>
                                        <button className="btn btn-sm btn-primary" onClick={() => run(() => onApprove(ev._id, "approved"))}>Approve</button>
                                        <button className="btn btn-sm btn-ghost" onClick={() => { setRejectModal({ isOpen: true, id: ev._id, type: "event" }); setRejectReason(""); }}>Reject</button>
                                    </div>
                                </div>
                            ))
                        ) : <div className="panel" style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No public events pending.</div>}
                    </div>
                </div>
            )}

            <section className="panel" style={{ maxWidth: 500, marginBottom: 40 }}>
                <h3 style={{ marginBottom: 20 }}>{editingEventId ? "Update Event" : "Create New Event"}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <input placeholder="Event Name" value={eventForm.name} onChange={e => setEventForm({ ...eventForm, name: e.target.value })} />
                    <textarea placeholder="Description" value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} style={{ width: '100%', background: 'var(--input-bg)', color: 'var(--ink)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px', fontSize: '1rem' }} rows={4} />

                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>Event Date & Time</div>
                        <input type="datetime-local" value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} />
                    </div>

                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>Event Photos (Optional)</div>
                        <input type="file" multiple accept="image/*" onChange={e => setEventForm({ ...eventForm, imageFiles: Array.from(e.target.files) })} style={{ padding: '8px' }} />
                        {eventForm.imageFiles?.length > 0 && <div style={{ fontSize: '0.8rem', color: 'var(--accent)', marginTop: 4 }}>{eventForm.imageFiles.length} files selected</div>}
                    </div>

                    <div className="tab-group" style={{ display: 'flex', background: 'var(--input-bg)', padding: 4, borderRadius: 12, border: '1px solid var(--border)', margin: '12px 0' }}>
                        <button className={`btn btn-sm ${!eventForm.isCustomLocation ? 'btn-primary' : ''}`} style={{ flex: 1, border: 'none', background: !eventForm.isCustomLocation ? 'var(--accent)' : 'transparent', color: !eventForm.isCustomLocation ? '#fff' : 'var(--muted)', height: 32, borderRadius: 8 }} onClick={() => setEventForm({ ...eventForm, isCustomLocation: false, locationName: "" })}>Venue</button>
                        <button className={`btn btn-sm ${eventForm.isCustomLocation ? 'btn-primary' : ''}`} style={{ flex: 1, border: 'none', background: eventForm.isCustomLocation ? 'var(--accent)' : 'transparent', color: eventForm.isCustomLocation ? '#fff' : 'var(--muted)', height: 32, borderRadius: 8 }} onClick={() => setEventForm({ ...eventForm, isCustomLocation: true, place: "" })}>Public</button>
                    </div>

                    {!eventForm.isCustomLocation ? (
                        <div>
                            <select value={eventForm.place} onChange={e => setEventForm({ ...eventForm, place: e.target.value })}>
                                <option value="">Select Venue...</option>
                                {places.filter(p => p.status === "approved").map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                            </select>
                            {eventForm.place && <button className="btn btn-sm btn-ghost" style={{ width: '100%', marginTop: 4 }} onClick={() => { const p = places.find(pl => pl._id === eventForm.place); if (p) loadAvailability(p._id, p.name); }}>Check Availability</button>}
                        </div>
                    ) : (
                        <input placeholder="Enter Location Name..." value={eventForm.locationName} onChange={e => setEventForm({ ...eventForm, locationName: e.target.value })} />
                    )}

                    <input type="number" placeholder="Max Tickets" value={eventForm.maxTickets} onChange={e => setEventForm({ ...eventForm, maxTickets: e.target.value })} style={{ marginTop: 12 }} />

                    <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={onSave}>{editingEventId ? "Save Changes" : "Create Event"}</button>
                        {editingEventId && <button className="btn btn-ghost" onClick={() => { setEditingEventId(null); setEventForm(initialEvent); }}>Cancel</button>}
                    </div>
                </div>
            </section>

            <h3 style={{ marginBottom: 16 }}>Manage Your Events</h3>
            <div className="grid">
                {events.filter(ev => ev.organizer?._id === profile?._id).map(ev => (
                    <EventCard key={ev._id} ev={ev} profile={profile} getImgUrl={getImgUrl} onEdit={() => onStartEdit(ev)} onDelete={() => onDelete(ev._id)} onShare={onShare} onViewDetails={onViewDetails} />
                ))}
            </div>
        </div>
    );
}

export function UserManagementView({ operators, onToggleApprove }) {
    return (
        <div className="animate-fade-in">
            <h3 style={{ marginBottom: 28, fontSize: '1.5rem', fontWeight: 800 }}>Providers Awaiting Verification</h3>
            <div className="grid">
                {operators.map(op => (
                    <div key={op._id} className="panel highlight-panel" style={{
                        padding: 24,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: 200,
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                            <div>
                                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 700 }}>{op.firstName} {op.lastName}</h4>
                                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <span>{op.email}</span>
                                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)', fontWeight: 700 }}>{op.role.replace('_', ' ')}</span>
                                </div>
                            </div>

                            {!op.isApproved && (
                                <span className="status-badge pending" style={{
                                    padding: '4px 10px',
                                    fontSize: '0.65rem',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    borderRadius: 8
                                }}>Pending</span>
                            )}
                            {op.isApproved && (
                                <span className="status-badge approved" style={{
                                    padding: '4px 10px',
                                    fontSize: '0.65rem',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    borderRadius: 8
                                }}>Verified</span>
                            )}
                        </div>

                        <div style={{ marginTop: 'auto' }}>
                            <button
                                className={`btn ${op.isApproved ? "btn-ghost" : "btn-primary"}`}
                                style={{
                                    width: '100%',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    height: 44,
                                    border: op.isApproved ? '1px solid rgba(239, 68, 68, 0.2)' : 'none',
                                    color: op.isApproved ? 'var(--bad)' : '#fff',
                                    background: op.isApproved ? 'rgba(239, 68, 68, 0.05)' : 'var(--accent)'
                                }}
                                onClick={() => onToggleApprove(op._id, op.isApproved)}
                            >
                                {op.isApproved ? "Revoke Verification" : "Verify Account"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {operators.length === 0 && (
                <div className="panel" style={{ textAlign: 'center', padding: '60px', opacity: 0.6 }}>
                    No providers found.
                </div>
            )}
        </div>
    );
}

export function ProfileView({ profileForm, setProfileForm, onSave, onLogout, onDeleteAccount, formErrors, getImgUrl }) {
    return (
        <div className="animate-fade-in" style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 60 }}>
            {/* Profile Hero Header */}
            <div className="profile-hero-card" style={{
                background: 'linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%)',
                height: 180, borderRadius: '24px 24px 0 0', position: 'relative', overflow: 'visible'
            }}>
                <div style={{
                    position: 'absolute', bottom: -50, left: 40, display: 'flex', alignItems: 'flex-end', gap: 24
                }}>
                    <div className="profile-avatar" style={{
                        width: 140, height: 140, border: '6px solid var(--panel)',
                        background: 'var(--panel)', boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                        borderRadius: '32px'
                    }}>
                        <img src={profileForm.newProfileImage ? URL.createObjectURL(profileForm.newProfileImage) : getImgUrl(profileForm.profileImage)} alt="profile" />
                    </div>
                    <div style={{ paddingBottom: 15 }}>
                        <h2 style={{ margin: 0, fontSize: '2rem', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                            {profileForm.firstName} {profileForm.lastName}
                        </h2>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', opacity: 0.9 }}>
                            <span style={{ fontSize: '0.9rem', color: '#fff' }}>{profileForm.email}</span>
                            <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', fontSize: '0.7rem' }}>{profileForm.role}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 32, marginTop: 80 }}>
                {/* Left Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="panel" style={{ padding: 12 }}>
                        <div style={{ padding: '8px 16px', fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Management</div>
                        <label className="nav-link" style={{ cursor: 'pointer', margin: '4px 0', border: 'none' }}>
                            <Icon.Plus /> Upload New Avatar
                            <input type="file" hidden accept="image/*" onChange={e => setProfileForm({ ...profileForm, newProfileImage: e.target.files[0] })} />
                        </label>
                        <div className="nav-link" onClick={onLogout} style={{ color: 'var(--bad)', border: 'none' }}><Icon.Lock /> Sign Out of Account</div>
                    </div>
                </div>

                {/* Main Settings Tabs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="panel" style={{ padding: 40 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                            <div className="logo-box" style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-soft)', color: 'var(--accent)' }}><Icon.User /></div>
                            <div>
                                <h3 style={{ margin: 0 }}>Personal Details</h3>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>Update your name and primary contact email</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                            <div className="form-group">
                                <label>First Name</label>
                                <input value={profileForm.firstName} onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })} placeholder="e.g. John" />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input value={profileForm.lastName} onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })} placeholder="e.g. Doe" />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginTop: 24 }}>
                            <label>Email Address</label>
                            <input value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} placeholder="john@example.com" />
                        </div>
                    </div>

                    <div className="panel" style={{ padding: 40 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                            <div className="logo-box" style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--bad)' }}><Icon.Lock /></div>
                            <div>
                                <h3 style={{ margin: 0 }}>Security & Privacy</h3>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>Manage your account security and password</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                            <div className="form-group">
                                <label>New Password</label>
                                <input type="password" placeholder="••••••••••••" value={profileForm.password} onChange={e => setProfileForm({ ...profileForm, password: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Confirm Password</label>
                                <input type="password" placeholder="••••••••••••" value={profileForm.confirmPassword} onChange={e => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                                    style={{ borderColor: formErrors?.passwordMatch ? 'var(--bad)' : '' }} />
                            </div>
                        </div>
                        {formErrors?.passwordMatch && (
                            <div style={{ color: 'var(--bad)', fontSize: '0.85rem', marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Icon.Lock /> {formErrors.passwordMatch}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
                        <button className="btn btn-primary" style={{ padding: '16px 48px', fontSize: '1rem', fontWeight: 700, borderRadius: 16, boxShadow: '0 8px 30px var(--accent-soft)' }} onClick={onSave}>
                            Save All Changes
                        </button>
                    </div>

                    {/* Danger Zone at the very bottom */}
                    <div className="panel" style={{ marginTop: 40, border: '1px solid var(--border)', background: 'transparent', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--bad)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                                <Icon.Lock style={{ width: 14, height: 14 }} /> Danger Zone
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: 0 }}>Once deleted, account data cannot be recovered.</p>
                        </div>
                        <button className="btn" style={{ background: 'transparent', border: '1px solid var(--bad)', color: 'var(--bad)', fontSize: '0.75rem', fontWeight: 600, padding: '8px 20px', width: 'auto' }} onClick={onDeleteAccount}>
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
