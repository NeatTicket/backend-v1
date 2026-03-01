import React, { useState, useEffect } from 'react';
import { Icon } from './Icons';

export function PlaceDetails({ place, getImgUrl, onClose }) {
    const [currentImage, setCurrentImage] = useState(null);

    useEffect(() => {
        if (place) {
            setCurrentImage(place.images?.[0] || place.image);
        }
    }, [place]);

    if (!place) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content auth-card" style={{ maxWidth: 800, padding: 0, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                <div style={{ position: 'relative', height: 400, background: 'var(--input-bg)' }}>
                    <img src={getImgUrl(currentImage)} alt={place.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.4s ease' }} />
                    <button className="theme-toggle" style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(0,0,0,0.4)', color: '#fff', border: 'none', width: 40, height: 40 }} onClick={onClose}><Icon.X /></button>
                </div>
                <div style={{ padding: 30 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div>
                            <h2 style={{ fontSize: '2rem', marginBottom: 4 }}>{place.name}</h2>
                            <div className="badge accent-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <Icon.Place style={{ width: 14, height: 14 }} /> {place.location}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>{place.capacity}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>Total Capacity</div>
                        </div>
                    </div>
                    <p className="description-text" style={{ fontSize: '1.05rem', marginBottom: 30, opacity: 0.9, lineHeight: 1.6 }}>{place.description}</p>

                    {place.images?.length > 1 && (
                        <div>
                            <h4 style={{ marginBottom: 16, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' }}>Venue Gallery</h4>
                            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 15 }} className="custom-scrollbar">
                                {place.images.map((img, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setCurrentImage(img)}
                                        style={{
                                            height: 100,
                                            width: 150,
                                            flexShrink: 0,
                                            borderRadius: 12,
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            border: currentImage === img ? '3px solid var(--accent)' : '3px solid transparent',
                                            transition: 'all 0.2s ease',
                                            transform: currentImage === img ? 'scale(0.95)' : 'none'
                                        }}
                                    >
                                        <img src={getImgUrl(img)} alt={`gallery-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
