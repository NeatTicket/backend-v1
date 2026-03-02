import React from 'react';
import { Icon } from './Icons';

export function VenueCard({ p, profile, getImgUrl, onEdit, onDelete, onSelect, onShare }) {
    const isAdmin = profile?.role === "admin";
    const isOwner = p.owner?._id === profile?._id;
    const canManage = profile && (isAdmin || isOwner);

    return (
        <div className="panel" style={{
            opacity: (p.status === "approved" || isAdmin) ? 1 : 0.85,
            borderColor: p.status === "approved" ? 'var(--border)' : p.status === "rejected" ? 'var(--bad)' : 'rgba(251,191,36,0.4)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
        }}>
            <div className="card-img-container" onClick={onSelect} style={{ cursor: 'pointer', height: 180, flexShrink: 0, background: 'var(--input-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {p.images?.[0] || p.image ? (
                    <img src={getImgUrl(p.images?.[0] || p.image)} alt={p.name} className="card-img" />
                ) : (
                    <Icon.Place style={{ width: 48, height: 48, opacity: 0.1 }} />
                )}
                {p.images?.length > 1 && <div className="badge" style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', color: '#fff' }}>+{p.images.length - 1} More</div>}
                {canManage && p.status !== "approved" && (
                    <div className={`status-badge ${p.status}`} style={{ position: 'absolute', top: 12, left: 12 }}>
                        {p.status === "pending" ? "Pending Review" : "Action Required"}
                    </div>
                )}
            </div>
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <h3 onClick={onSelect} style={{
                        cursor: 'pointer',
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        fontSize: '1.2rem',
                        lineHeight: 1.3
                    }} title={p.name}>{p.name}</h3>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        {onShare && <button className="theme-toggle" style={{ width: 32, height: 32, background: 'var(--accent)', color: '#fff', border: 'none' }} onClick={(e) => { e.stopPropagation(); onShare(p, 'venue'); }} title="Share Venue"><Icon.Share style={{ width: 14, height: 14 }} /></button>}
                        {canManage && (
                            <>
                                {onEdit && <button className="theme-toggle" style={{ width: 32, height: 32 }} onClick={onEdit}><Icon.Edit style={{ width: 14, height: 14 }} /></button>}
                                {onDelete && <button className="theme-toggle" style={{ width: 32, height: 32, color: 'var(--bad)' }} onClick={onDelete}><Icon.Trash style={{ width: 14, height: 14 }} /></button>}
                            </>
                        )}
                    </div>
                </div>

                {canManage && p.status === "rejected" && p.rejectionReason && (
                    <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', color: 'var(--bad)', fontSize: '0.8rem', borderRadius: 8, marginTop: 12 }}>
                        {p.rejectionReason}
                    </div>
                )}
                <div style={{ padding: '16px 0', flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Venue Information</div>
                    <p className="description-text" style={{
                        fontSize: "0.85rem",
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.5,
                        opacity: 0.8
                    }}>{p.description || 'No description provided.'}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div className="badge accent-badge" style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.location}</div>
                        {isAdmin && p.owner && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 600 }}>By: {p.owner.firstName}</div>
                        )}
                    </div>
                    <button className="btn btn-sm btn-ghost" style={{ fontSize: '0.72rem', height: 'auto', padding: '6px 12px' }} onClick={onSelect}>View Details</button>
                </div>
            </div>
        </div>
    );
}

export function EventCard({ ev, profile, onEdit, onDelete, onBook, onShare, onViewDetails, getTicketStatusBadge, getImgUrl }) {
    const isAdmin = profile?.role === "admin";
    const organizerId = ev.organizer?._id || ev.organizer;
    const isOwner = profile?._id && organizerId && organizerId.toString() === profile._id.toString();
    const canManage = profile && (isAdmin || isOwner);

    return (
        <div className="panel" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 12 }}>
                <div style={{ flex: 1 }}>
                    {canManage && (
                        <span className={`status-badge ${ev.status}`} style={{ marginBottom: 12, display: 'inline-block' }}>{ev.status}</span>
                    )}
                    <h3 style={{
                        margin: 0,
                        fontSize: '1.25rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.3,
                        cursor: onViewDetails ? 'pointer' : 'default'
                    }} onClick={() => onViewDetails?.(ev)} title={ev.name}>{ev.name}</h3>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button className="theme-toggle" style={{ width: 36, height: 36, background: 'var(--accent)', color: '#fff', border: 'none' }} onClick={() => onShare(ev)} title="Share Event"><Icon.Share style={{ width: 14, height: 14 }} /></button>
                    {canManage && (
                        <>
                            {onEdit && <button className="theme-toggle" style={{ width: 32, height: 32 }} onClick={onEdit}><Icon.Edit style={{ width: 14, height: 14 }} /></button>}
                            {onDelete && <button className="theme-toggle" style={{ width: 32, height: 32, color: 'var(--bad)' }} onClick={onDelete}><Icon.Trash style={{ width: 14, height: 14 }} /></button>}
                        </>
                    )}
                </div>
            </div>

            <div
                style={{ position: 'relative', height: 160, borderRadius: 12, overflow: 'hidden', marginBottom: 20, background: 'var(--input-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: onViewDetails ? 'pointer' : 'default' }}
                onClick={() => onViewDetails?.(ev)}
                title={onViewDetails ? "View event details" : undefined}
            >
                {ev.images?.[0] ? (
                    <img src={getImgUrl(ev.images[0])} alt={ev.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <Icon.Event style={{ width: 48, height: 48, opacity: 0.1 }} />
                )}
                {ev.images?.length > 1 && <div className="badge" style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.7rem' }}>+{ev.images.length - 1}</div>}
            </div>

            <p className="description-text" style={{
                marginBottom: 20,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                fontSize: '0.9rem',
                minHeight: '2.7em',
                lineHeight: 1.5,
                opacity: 0.8
            }}>{ev.description}</p>

            <div style={{ marginTop: 'auto' }}>
                <div className="badge ok" style={{ marginBottom: 12, padding: '8px 14px', background: 'var(--accent-soft)', border: 'none', color: 'var(--accent)', fontWeight: 700, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Icon.Event style={{ width: 14, height: 14 }} />
                    {ev.date ? new Date(ev.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Date TBA'}
                </div>

                <div style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon.Place style={{ width: 14, height: 14 }} />
                        <span style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}><strong>{ev.displayLocation || 'Location TBA'}</strong></span>
                    </div>
                    {isAdmin && ev.organizer && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 600 }}>By: {ev.organizer.firstName || "Owner"}</div>
                    )}
                </div>

                {canManage && ev.status === "rejected" && ev.rejectionReason && (
                    <div style={{ marginBottom: 16, padding: 12, borderRadius: 10, background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', color: 'var(--bad)', fontSize: '0.8rem' }}>
                        <strong>Rejection Note:</strong> {ev.rejectionReason}
                    </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                    {onBook && ev.status === "approved" && (
                        <button className="btn btn-primary" style={{ flex: 1, padding: '12px', fontWeight: 700 }} onClick={onBook}>
                            Book Ticket
                        </button>
                    )}
                    {onViewDetails && (
                        <button className="btn btn-ghost" style={{ flex: onBook ? 0.5 : 1, padding: '12px', fontWeight: 600, border: '1px solid var(--border)' }} onClick={() => onViewDetails(ev)}>
                            Details
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
