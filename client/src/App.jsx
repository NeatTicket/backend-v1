import { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import useSWR from "swr";

// ─── API & Libs ─────────────────────────────────
import { loginUser, registerUser } from "./features/auth/api/authApi";
import { useProfile } from "./features/auth/hooks/useProfile";
import axiosInstance from "./lib/axios";
import { initialRegister, initialLogin, initialPlace, initialEvent } from "./lib/constants";

// ─── Components ─────────────────────────────────
import { Toast, Modal } from "./components/common/UIElements";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { VenueCard, EventCard } from "./components/common/Cards";
import { PlaceDetails } from "./components/common/PlaceDetails";
import { AvailabilityCalendar } from "./components/venue/AvailabilityCalendar";
import * as Views from "./components/Views";

import "./styles.css";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const savedTheme = localStorage.getItem("neatTicketTheme") || "dark";
  const [theme, setTheme] = useState(savedTheme);

  const getViewFromPath = (path) => {
    const p = path.replace(/^\/+/, "");
    if (p.startsWith("events/") && p.split("/")[1]) return "event_details";
    return p || "overview";
  };

  const [view, setView] = useState(getViewFromPath(location.pathname));

  useEffect(() => {
    setView(getViewFromPath(location.pathname));
  }, [location.pathname]);

  const eventIdFromPath = useMemo(() => {
    const parts = location.pathname.split("/");
    return parts[1] === "events" ? parts[2] : null;
  }, [location.pathname]);

  const changeView = (v) => navigate(v === "overview" ? "/" : `/${v}`);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("neatTicketTheme", theme);
  }, [theme]);

  const [token, setToken] = useState(localStorage.getItem("neatTicketToken") || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [placeForm, setPlaceForm] = useState(initialPlace);
  const [eventForm, setEventForm] = useState(initialEvent);
  const [search, setSearch] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [operators, setOperators] = useState([]);
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "", profileImage: "" });
  const [editingPlaceId, setEditingPlaceId] = useState(null);
  const [editingEventId, setEditingEventId] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [availabilityPlaceName, setAvailabilityPlaceName] = useState("");
  const [showAvailability, setShowAvailability] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [rejectModal, setRejectModal] = useState({ isOpen: false, id: null, type: "place" });
  const [rejectReason, setRejectReason] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getImgUrl = (url) => {
    if (!url) return "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800";
    if (url.startsWith("http")) return url;
    const base = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace("/api", "");
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const getTicketStatusBadge = (status) => {
    if (status === "used") return <span className="status-badge" style={{ background: 'var(--panel-hover)', color: 'var(--muted)' }}>USED</span>;
    if (status === "expired") return <span className="status-badge rejected">EXPIRED</span>;
    return <span className="status-badge approved">ACTIVE</span>;
  };

  const authHeadersExist = useMemo(() => Boolean(token), [token]);
  const { profile, mutate: mutateProfile } = useProfile();

  const fetcher = (url) => axiosInstance.get(url).then(res => res.data.data);
  const { data: statsData, mutate: mutateStats } = useSWR(authHeadersExist && profile?.role === "admin" ? '/stats/overview' : null, fetcher, { refreshInterval: 10000 });
  const { data: publicStats } = useSWR('/stats/public', fetcher, { refreshInterval: 60000 });
  const { data: placesData, mutate: mutatePlaces } = useSWR('/places' + (search ? `?search=${search}` : ''), fetcher, { refreshInterval: 10000 });
  const places = placesData?.places || [];
  const { data: eventsData, mutate: mutateEvents } = useSWR(`/events?upcoming=true${search ? `&search=${encodeURIComponent(search)}` : ''}`, fetcher, { refreshInterval: 10000 });
  const events = eventsData?.events || [];
  const { data: ticketsData, mutate: mutateTickets } = useSWR(authHeadersExist ? '/tickets/me' : null, fetcher, { refreshInterval: 15000 });
  const { data: notifData, mutate: mutateNotifs } = useSWR(authHeadersExist ? '/notifications' : null, fetcher, { refreshInterval: 12000 });
  const unreadCount = notifData?.unreadCount || 0;

  async function run(action) {
    setLoading(true); setError(""); setMessage(""); setFormErrors({});
    try { await action(); } catch (err) { setError(err.response?.data?.message || err.message || "Action failed"); }
    finally { setLoading(false); }
  }

  const handleLogin = () => run(async () => {
    const res = await loginUser(loginForm);
    setToken(res.token || ""); mutateProfile(); changeView(res.user?.role === "admin" ? "overview" : "places");
  });

  const handleRegister = () => run(async () => {
    if (registerForm.password !== registerForm.confirmPassword) throw new Error("Passwords do not match");
    await registerUser(registerForm); changeView("login");
  });

  const clearSession = () => {
    setToken(""); localStorage.removeItem("neatTicketToken");
    mutateProfile(null, false); changeView("login");
  };

  const handleSavePlace = () => run(async () => {
    const data = new FormData();
    Object.keys(placeForm).forEach(k => { if (k === 'imageFiles') placeForm[k].forEach(f => data.append("images", f)); else data.append(k, placeForm[k]); });
    if (editingPlaceId) await axiosInstance.patch(`/places/${editingPlaceId}`, data, { headers: { "Content-Type": "multipart/form-data" } });
    else await axiosInstance.post("/places", data, { headers: { "Content-Type": "multipart/form-data" } });
    setPlaceForm(initialPlace); setEditingPlaceId(null); mutatePlaces(); setMessage("Venue Saved!");
  });

  const handleConfirmDelete = async () => {
    if (deleteType === "account") {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'}/users/${profile._id}`, { headers: { Authorization: `Bearer ${token}` } }).then(clearSession);
    }
    else if (deleteType === "place") {
      await run(() => axiosInstance.delete(`/places/${deleteId}`).then(() => {
        mutatePlaces();
        setSelectedPlace(null);
      }));
    }
    else if (deleteType === "event") {
      await run(() => axiosInstance.delete(`/events/${deleteId}`).then(() => {
        mutateEvents();
        if (view === "event_details") changeView("events");
      }));
    }
    else if (deleteType === "ticket") { await run(() => axiosInstance.delete(`/tickets/${deleteId}`).then(mutateTickets)); }
    setIsDeleteModalOpen(false);
  };

  const handleSaveEvent = () => run(async () => {
    if (!eventForm.isCustomLocation && !eventForm.place) throw new Error("Venue required");
    const data = new FormData();
    Object.keys(eventForm).forEach(k => {
      if (k === 'imageFiles') {
        eventForm[k].forEach(f => data.append("images", f));
      } else if (k === 'date') {
        data.append(k, new Date(eventForm[k]).toISOString());
      } else {
        data.append(k, eventForm[k]);
      }
    });

    if (editingEventId) await axiosInstance.patch(`/events/${editingEventId}`, data, { headers: { "Content-Type": "multipart/form-data" } });
    else await axiosInstance.post("/events", data, { headers: { "Content-Type": "multipart/form-data" } });

    setEventForm(initialEvent); setEditingEventId(null); mutateEvents(); mutateStats(); setMessage("Event Saved!");
  });

  const handleShare = (ev) => {
    const url = `${window.location.origin}/events/${ev._id}`;
    navigator.clipboard.writeText(url).then(() => {
      setMessage("Link copied to clipboard!");
    }).catch(err => {
      setError("Failed to copy link");
    });
  };

  const loadAvailability = async (placeId, placeName) => {
    run(async () => {
      const res = await axiosInstance.get(`/places/${placeId}/availability`);
      setAvailabilitySlots(res.data?.data?.bookedSlots || []); setAvailabilityPlaceName(placeName); setShowAvailability(true);
    });
  };

  const startEditEvent = (evt) => {
    setEditingEventId(evt._id);
    setEventForm({ ...evt, date: new Date(evt.date).toISOString().slice(0, 16), place: evt.place?._id });
  };

  useEffect(() => {
    if (profile) setProfileForm({ ...profile, password: "", confirmPassword: "" });
  }, [profile]);

  useEffect(() => {
    if (view === "users" && authHeadersExist && profile?.role === "admin") axiosInstance.get("/users/operators").then(res => setOperators(res.data?.data?.operators || []));
  }, [view, authHeadersExist, profile]);

  return (
    <div className="app-shell" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar view={view} changeView={changeView} profile={profile} authHeadersExist={authHeadersExist} clearSession={clearSession} />

      <main className="main-content" style={{ flex: 1, padding: '20px 40px', overflowY: 'auto' }}>
        <Header
          view={view} profile={profile} showNotifications={showNotifications} setShowNotifications={setShowNotifications}
          unreadCount={unreadCount} notifications={notifData?.notifications || []} mutateNotifs={mutateNotifs}
          changeView={changeView} showProfileMenu={showProfileMenu} setShowProfileMenu={setShowProfileMenu}
          getImgUrl={getImgUrl} axiosInstance={axiosInstance} clearSession={clearSession}
          theme={theme} setTheme={setTheme} search={search} setSearch={setSearch}
          searchCategory={searchCategory} setSearchCategory={setSearchCategory}
        />

        <div className="content-body" style={{ marginTop: 30 }}>
          {loading && <div className="loading-overlay">Loading...</div>}

          {view === "overview" && <Views.Overview profile={profile} stats={statsData} publicStats={publicStats} authHeadersExist={authHeadersExist} changeView={changeView} places={places} getImgUrl={getImgUrl} setSelectedPlace={setSelectedPlace} />}
          {view === "places" && (
            <div className="grid animate-fade-in">
              {places
                .filter(p => {
                  if (search && searchCategory !== "all" && searchCategory !== "venues") return false;
                  const s = search.toLowerCase();
                  return !search || p.name.toLowerCase().includes(s) || p.location.toLowerCase().includes(s);
                })
                .map(p => {
                  const isOwner = p.owner?._id === profile?._id;
                  return (
                    <VenueCard
                      key={p._id}
                      p={p}
                      profile={profile}
                      getImgUrl={getImgUrl}
                      onSelect={() => setSelectedPlace(p)}
                      onEdit={isOwner ? () => { setEditingPlaceId(p._id); setPlaceForm(p); changeView("my_venues"); } : undefined}
                      onDelete={profile?.role === "admin" || isOwner ? () => { setDeleteId(p._id); setDeleteType("place"); setIsDeleteModalOpen(true); } : undefined}
                    />
                  );
                })}
            </div>
          )}
          {view === "events" && (
            <div className="grid animate-fade-in">
              {events
                .filter(ev => ev.status === "approved" || profile?.role === "admin")
                .filter(ev => {
                  if (search && searchCategory !== "all" && searchCategory !== "events") return false;
                  const s = search.toLowerCase();
                  return !search || ev.name.toLowerCase().includes(s) || (ev.displayLocation || "").toLowerCase().includes(s);
                })
                .map(ev => {
                  const isOwner = (ev.organizer?._id || ev.organizer) === profile?._id;
                  return (
                    <EventCard
                      key={ev._id}
                      ev={ev}
                      profile={profile}
                      getImgUrl={getImgUrl}
                      onBook={() => run(() => axiosInstance.post(`/tickets/events/${ev._id}`, { quantity: 1 }).then(() => { mutateEvents(); mutateTickets(); setMessage("Ticket Booked!"); }))}
                      onShare={handleShare}
                      onViewDetails={(e) => navigate(`/events/${e._id}`)}
                      getTicketStatusBadge={getTicketStatusBadge}
                      onEdit={isOwner ? () => startEditEvent(ev) : undefined}
                      onDelete={profile?.role === "admin" || isOwner ? (id) => { setDeleteId(id); setDeleteType("event"); setIsDeleteModalOpen(true); } : undefined}
                    />
                  );
                })}
            </div>
          )}
          {view === "event_details" && (
            <Views.EventDetailsView
              eventId={eventIdFromPath}
              profile={profile}
              getImgUrl={getImgUrl}
              onBook={(id) => run(() => axiosInstance.post(`/tickets/events/${id}`, { quantity: 1 }).then(() => { mutateEvents(); mutateTickets(); setMessage("Ticket Booked!"); }))}
              onShare={handleShare}
              onEdit={(ev) => { setEditingEventId(ev._id); setEventForm({ ...ev, date: ev.date ? new Date(ev.date).toISOString().slice(0, 16) : "" }); changeView("my_events"); }}
              onDelete={(id) => { setDeleteId(id); setDeleteType("event"); setIsDeleteModalOpen(true); }}
              changeView={changeView}
            />
          )}
          {view === "my_venues" && <Views.MyVenuesView profile={profile} places={places} editingPlaceId={editingPlaceId} setEditingPlaceId={setEditingPlaceId} placeForm={placeForm} setPlaceForm={setPlaceForm} onSave={handleSavePlace} onStartEdit={(p) => { setEditingPlaceId(p._id); setPlaceForm(p); }} onDelete={(id) => { setDeleteId(id); setDeleteType("place"); setIsDeleteModalOpen(true); }} onSelect={setSelectedPlace} setRejectModal={setRejectModal} setRejectReason={setRejectReason} updatePlaceStatus={(id, s, r) => axiosInstance.patch(`/places/${id}/approve`, { status: s, reason: r }).then(mutatePlaces)} run={run} initialPlace={initialPlace} getImgUrl={getImgUrl} search={search} searchCategory={searchCategory} forcePersonalOnly={true} />}
          {view === "admin_venues" && profile?.role === "admin" && <Views.MyVenuesView profile={profile} places={places} editingPlaceId={editingPlaceId} setEditingPlaceId={setEditingPlaceId} placeForm={placeForm} setPlaceForm={setPlaceForm} onSave={handleSavePlace} onStartEdit={(p) => { setEditingPlaceId(p._id); setPlaceForm(p); }} onDelete={(id) => { setDeleteId(id); setDeleteType("place"); setIsDeleteModalOpen(true); }} onSelect={setSelectedPlace} setRejectModal={setRejectModal} setRejectReason={setRejectReason} updatePlaceStatus={(id, s, r) => axiosInstance.patch(`/places/${id}/approve`, { status: s, reason: r }).then(mutatePlaces)} run={run} initialPlace={initialPlace} getImgUrl={getImgUrl} search={search} searchCategory={searchCategory} forceGlobalOnly={true} />}
          {view === "my_events" && <Views.MyEventsView profile={profile} events={events} places={places} editingEventId={editingEventId} setEditingEventId={setEditingEventId} eventForm={eventForm} setEventForm={setEventForm} onSave={handleSaveEvent} onStartEdit={startEditEvent} onDelete={(id) => { setDeleteId(id); setDeleteType("event"); setIsDeleteModalOpen(true); }} onApprove={(id, s, r) => axiosInstance.patch(`/events/${id}/approve`, { status: s, reason: r }).then(mutateEvents)} onShare={handleShare} onViewDetails={(e) => navigate(`/events/${e._id}`)} setRejectModal={setRejectModal} setRejectReason={setRejectReason} run={run} initialEvent={initialEvent} loadAvailability={loadAvailability} getImgUrl={getImgUrl} search={search} searchCategory={searchCategory} forcePersonalOnly={true} />}
          {view === "admin_events" && profile?.role === "admin" && <Views.MyEventsView profile={profile} events={events} places={places} editingEventId={editingEventId} setEditingEventId={setEditingEventId} eventForm={eventForm} setEventForm={setEventForm} onSave={handleSaveEvent} onStartEdit={startEditEvent} onDelete={(id) => { setDeleteId(id); setDeleteType("event"); setIsDeleteModalOpen(true); }} onApprove={(id, s, r) => axiosInstance.patch(`/events/${id}/approve`, { status: s, reason: r }).then(mutateEvents)} onShare={handleShare} onViewDetails={(e) => navigate(`/events/${e._id}`)} setRejectModal={setRejectModal} setRejectReason={setRejectReason} run={run} initialEvent={initialEvent} loadAvailability={loadAvailability} getImgUrl={getImgUrl} search={search} searchCategory={searchCategory} forceGlobalOnly={true} />}
          {view === "tickets" && <Views.TicketsView tickets={ticketsData?.tickets || []} getTicketStatusBadge={getTicketStatusBadge} getImgUrl={getImgUrl} useTicketAction={(id) => run(async () => { await axiosInstance.patch(`/tickets/${id}/use`); mutateTickets(); setMessage("Checked-In!"); })} onDelete={(id) => { setDeleteId(id); setDeleteType("ticket"); setIsDeleteModalOpen(true); }} />}
          {view === "users" && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Provider Management</h2>
                <div style={{ display: 'flex', background: 'var(--panel)', padding: 4, borderRadius: 12, border: '1px solid var(--border)', gap: 4 }}>
                  {["all", "pending", "approved"].map(f => (
                    <button
                      key={f}
                      className={`btn btn-sm ${providerFilter === f ? 'btn-primary' : ''}`}
                      style={{ border: 'none', background: providerFilter === f ? 'var(--accent)' : 'transparent', color: providerFilter === f ? '#fff' : 'var(--muted)', height: 32, borderRadius: 8, padding: '0 20px', textTransform: 'capitalize', margin: 0 }}
                      onClick={() => setProviderFilter(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <section className="panel" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
                    <thead style={{ background: 'var(--panel-hover)', borderBottom: '1px solid var(--border)' }}>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Provider</th>
                        <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                        <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                        <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Joined</th>
                        <th style={{ textAlign: 'right', padding: '16px 20px', fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody style={{ background: 'var(--panel)' }}>
                      {operators
                        .filter(u => {
                          if (search && searchCategory !== "all" && searchCategory !== "owners") return false;
                          const s = search.toLowerCase();
                          const matchesSearch = !search ||
                            `${u.firstName} ${u.lastName}`.toLowerCase().includes(s) ||
                            u.email.toLowerCase().includes(s) ||
                            u.role.toLowerCase().includes(s);

                          if (providerFilter === "pending") return matchesSearch && !u.isApproved;
                          if (providerFilter === "approved") return matchesSearch && u.isApproved;
                          return matchesSearch;
                        })
                        .map(op => {
                          const joinDate = op.createdAt ? new Date(op.createdAt).toLocaleDateString() : 'New';
                          return (
                            <tr key={op._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                              <td style={{ padding: '16px 20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                  <div className="profile-avatar" style={{ width: 44, height: 44, borderRadius: 12, border: '2px solid var(--accent-soft)', flexShrink: 0 }}>
                                    <img src={getImgUrl(op.profileImage)} alt="avatar" />
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{op.firstName} {op.lastName}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{op.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '16px 20px' }}><span className={`role-badge role-${op.role}`} style={{ fontWeight: 700 }}>{op.role.replace('_', ' ')}</span></td>
                              <td style={{ padding: '16px 20px' }}>
                                <span className={`status-badge ${op.isApproved ? 'approved' : 'pending'}`} style={{ fontSize: '0.65rem' }}>
                                  {op.isApproved ? 'VERIFIED' : 'PENDING'}
                                </span>
                              </td>
                              <td style={{ padding: '16px 20px', fontSize: '0.85rem', color: 'var(--muted)' }}>{joinDate}</td>
                              <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                  {!op.isApproved ? (
                                    <button className="btn btn-sm btn-primary" style={{ padding: '6px 16px', borderRadius: 8 }} onClick={() => run(() => axiosInstance.patch(`/users/${op._id}/approve`, { isApproved: true }).then(() => axiosInstance.get("/users/operators").then(res => setOperators(res.data?.data?.operators || []))))}>Verify</button>
                                  ) : (
                                    <button className="btn btn-sm btn-ghost" style={{ padding: '6px 16px', borderRadius: 8, color: 'var(--bad)' }} onClick={() => run(() => axiosInstance.patch(`/users/${op._id}/approve`, { isApproved: false }).then(() => axiosInstance.get("/users/operators").then(res => setOperators(res.data?.data?.operators || []))))}>Revoke</button>
                                  )}
                                  <button className="btn btn-sm" style={{ background: 'var(--bad-soft)', color: 'var(--bad)', border: 'none', width: 32, height: 32, padding: 0, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => run(() => axiosInstance.delete(`/users/${op._id}`).then(() => axiosInstance.get("/users/operators").then(res => setOperators(res.data?.data?.operators || []))))}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      {(operators.length === 0 || operators.filter(op => {
                        const s = search.toLowerCase();
                        const matchesSearch = !search ||
                          `${op.firstName} ${op.lastName}`.toLowerCase().includes(s) ||
                          op.email.toLowerCase().includes(s) ||
                          op.role.toLowerCase().includes(s);

                        if (providerFilter === "pending") return matchesSearch && !op.isApproved;
                        if (providerFilter === "approved") return matchesSearch && op.isApproved;
                        return matchesSearch;
                      }).length === 0) && (
                          <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>No providers found.</td></tr>
                        )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
          {view === "profile" && <Views.ProfileView profileForm={profileForm} setProfileForm={setProfileForm} onSave={() => run(async () => {
            if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
              setFormErrors({ passwordMatch: "Passwords do not match" });
              return;
            }
            setFormErrors({});
            const data = new FormData();
            Object.keys(profileForm).forEach(k => {
              if (k === 'newProfileImage') {
                if (profileForm[k]) data.append("profileImage", profileForm[k]);
              } else if (k !== 'confirmPassword') {
                data.append(k, profileForm[k]);
              }
            });
            await axiosInstance.patch("/profile", data, { headers: { "Content-Type": "multipart/form-data" } });
            mutateProfile();
            setMessage("Profile & Security Updated!");
          })} onLogout={clearSession} onDeleteAccount={() => { setDeleteType("account"); setIsDeleteModalOpen(true); }} formErrors={formErrors} getImgUrl={getImgUrl} />}
          {view === "login" && <Views.LoginView loginForm={loginForm} setLoginForm={setLoginForm} onLogin={handleLogin} changeView={changeView} />}
          {view === "register" && <Views.RegisterView registerForm={registerForm} setRegisterForm={setRegisterForm} onRegister={handleRegister} changeView={changeView} formErrors={formErrors} />}
        </div>

        <PlaceDetails place={selectedPlace} getImgUrl={getImgUrl} onClose={() => setSelectedPlace(null)} />
        {showAvailability && <AvailabilityCalendar slots={availabilitySlots} placeName={availabilityPlaceName} onClose={() => setShowAvailability(false)} />}
        <Toast message={message} type="success" onClose={() => setMessage("")} />
        <Toast message={error} type="error" onClose={() => setError("")} />
        <Modal isOpen={isDeleteModalOpen} title="Confirm Deletion" onConfirm={handleConfirmDelete} onCancel={() => setIsDeleteModalOpen(false)}>Are you sure you want to permanently delete this?</Modal>

        {rejectModal.isOpen && (
          <Modal isOpen={true} title={`Reject ${rejectModal.type}`} onConfirm={() => run(async () => {
            const url = rejectModal.type === "place" ? `/places/${rejectModal.id}/approve` : `/events/${rejectModal.id}/approve`;
            await axiosInstance.patch(url, { status: "rejected", reason: rejectReason });
            rejectModal.type === "place" ? mutatePlaces() : mutateEvents();
            setRejectModal({ isOpen: false, id: null });
          })} onCancel={() => setRejectModal({ isOpen: false, id: null })} confirmText="Send Rejection">
            <textarea placeholder="Reason for rejection..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} style={{ width: '100%', marginTop: 10 }} rows={3} />
          </Modal>
        )}
      </main>
    </div>
  );
}
