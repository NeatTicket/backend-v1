import React from 'react';

export function AvailabilityCalendar({ slots, placeName, onClose }) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let i = 1; i <= daysInMonth; i++) cells.push(i);

    const isBooked = (day) => {
        if (!day) return false;
        const dateStr = new Date(year, month, day).toDateString();
        return slots.some(s => new Date(s.date).toDateString() === dateStr && s.status === 'approved');
    };

    const getSlot = (day) => {
        const dateStr = new Date(year, month, day).toDateString();
        return slots.find(s => new Date(s.date).toDateString() === dateStr && s.status === 'approved');
    };

    const isToday = (day) => {
        return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    };

    return (
        <div className="modal-overlay" style={{ zIndex: 5000 }}>
            <div className="modal-content" style={{ maxWidth: 450 }}>
                <h3 style={{ marginBottom: 4 }}>Venue Calendar</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 20 }}>Availability for <strong>{placeName}</strong> — {today.toLocaleString('default', { month: 'long' })} {year}</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', padding: '4px 0' }}>{d}</div>
                    ))}
                </div>

                <div style={{ gridDisplay: 'grid', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                    {cells.map((day, i) => {
                        if (!day) return <div key={`empty-${i}`} />;
                        const booked = isBooked(day);
                        const slot = getSlot(day);
                        const todayCell = isToday(day);
                        return (
                            <div key={day} title={booked ? `Booked: ${slot?.name}` : 'Available'} style={{
                                textAlign: 'center', padding: '8px 4px', borderRadius: 8, fontSize: '0.85rem', fontWeight: todayCell ? 700 : 400,
                                background: booked ? 'rgba(239,68,68,0.18)' : 'var(--panel-hover)',
                                border: todayCell ? '2px solid var(--accent)' : booked ? '1px solid rgba(239,68,68,0.5)' : '1px solid var(--border)',
                                color: booked ? 'var(--bad)' : 'var(--ink)',
                                cursor: booked ? 'not-allowed' : 'default',
                                position: 'relative',
                            }}>
                                {day}
                                {booked && <div style={{ fontSize: '0.58rem', color: 'var(--bad)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Locked</div>}
                            </div>
                        );
                    })}
                </div>

                {slots.length > 0 && (
                    <div style={{ marginTop: 20 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Booked Events</div>
                        {slots.map(slot => (
                            <div key={slot._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.84rem' }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{slot.name}</div>
                                    <div style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{new Date(slot.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
                                </div>
                                <span className={`status-badge ${slot.status}`}>{slot.status}</span>
                            </div>
                        ))}
                    </div>
                )}

                {slots.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--good)', fontWeight: 600 }}>Fully Available — No upcoming bookings</div>
                )}

                <button className="btn btn-ghost" style={{ width: '100%', marginTop: 20 }} onClick={onClose}>Close</button>
            </div>
        </div>
    );
}
