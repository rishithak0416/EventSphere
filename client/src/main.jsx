import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { CalendarDays, MapPin, Users, Sparkles, Ticket, Plus, X, Search } from "lucide-react";
import "./style.css";

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
function App() {
  const [events, setEvents] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({ name: "", email: "" });
  const [newEvent, setNewEvent] = useState({ title: "", category: "Technology", date: "", venue: "", description: "", capacity: 100 });
  const [loading, setLoading] = useState(true);

  async function loadEvents() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/events`);
      if (!res.ok) throw new Error();
      setEvents(await res.json());
    } catch { setNotice("Could not reach the API. Start the backend and check VITE_API_URL."); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadEvents(); }, []);
  const filtered = events.filter(e => `${e.title} ${e.category} ${e.venue}`.toLowerCase().includes(query.toLowerCase()));

  async function register(e) {
    e.preventDefault(); setNotice("");
    try {
      const res = await fetch(`${API}/registrations`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ eventId: selected._id, ...form }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed.");
      setNotice(`You're registered for ${selected.title}!`);
      setSelected(null); setForm({name:"",email:""});
    } catch (err) { setNotice(err.message); }
  }
  async function createEvent(e) {
    e.preventDefault(); setNotice("");
    try {
      const res = await fetch(`${API}/events`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(newEvent) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not create event.");
      setNotice("Event created successfully."); setShowAdmin(false);
      setNewEvent({ title:"", category:"Technology", date:"", venue:"", description:"", capacity:100 });
      loadEvents();
    } catch (err) { setNotice(err.message); }
  }

  return <div className="app">
    <header className="topbar"><a className="brand" href="#"><span className="brand-icon"><Sparkles size={19}/></span> EventSphere</a><nav><a href="#events">Explore events</a><button className="outline-btn" onClick={() => setShowAdmin(true)}><Plus size={16}/> Organizer</button></nav></header>
    <main>
      <section className="hero"><div className="hero-copy"><div className="eyebrow"><span className="pulse"/> YOUR CAMPUS, YOUR MOMENT</div><h1>Make room for<br/><span>something amazing.</span></h1><p>Discover campus events, meet your people, and turn your interests into experiences.</p><a className="primary-btn" href="#events">Explore events <span>↗</span></a><div className="hero-stats"><div><strong>{events.length.toString().padStart(2,"0")}</strong><small>Featured events</small></div><div><strong>01</strong><small>Campus community</small></div><div><strong>∞</strong><small>New experiences</small></div></div></div><div className="hero-art"><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div><div className="art-card"><div className="art-top"><span>UP NEXT</span><span className="art-dot"></span></div><div className="art-date">OCT <b>20</b></div><div className="art-title">AI & Innovation<br/>Summit</div><div className="art-footer"><span><MapPin size={13}/> Central Auditorium</span><span className="ticket-icon"><Ticket size={20}/></span></div></div><div className="floating f-one">✦ CREATE</div><div className="floating f-two">MEET • LEARN • BUILD</div></div></section>
      {notice && <div className="notice"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss"><X size={16}/></button></div>}
      <section id="events" className="events-section"><div className="section-heading"><div><div className="eyebrow">FIND YOUR NEXT THING</div><h2>Events worth showing up for<span>.</span></h2><p>Find a workshop, a new idea, or your next favourite memory.</p></div><label className="search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search events..."/></label></div>
      {loading ? <p className="empty">Loading events…</p> : filtered.length === 0 ? <p className="empty">No events found. Try another search.</p> : <div className="event-grid">{filtered.map((event,i)=><article className="event-card" key={event._id}><div className={`event-visual visual-${i%3}`}><span className="category">{event.category || "Campus Event"}</span><span className="visual-symbol">{["✳","◈","✦"][i%3]}</span><span className="visual-number">0{i+1}</span></div><div className="event-content"><div className="event-date"><CalendarDays size={15}/>{event.date}</div><h3>{event.title}</h3><p>{event.description}</p><div className="event-meta"><span><MapPin size={14}/>{event.venue}</span><span><Users size={14}/>{event.capacity || 100} seats</span></div><button className="register-btn" onClick={()=>{setSelected(event);setForm({name:"",email:""});}}>Register for event <span>↗</span></button></div></article>)}</div>}
      </section>
      <section className="cta"><div><div className="eyebrow">HAVE SOMETHING TO SHARE?</div><h2>Bring your idea to campus.</h2><p>Organizers can add an event and invite the community to take part.</p></div><button className="light-btn" onClick={()=>setShowAdmin(true)}>Create an event <Plus size={16}/></button></section>
    </main>
    <footer><a className="brand" href="#"><span className="brand-icon"><Sparkles size={17}/></span> EventSphere</a><span>Designed for campus communities · MERN Stack Project</span><span>© 2026 EventSphere</span></footer>
    {selected && <div className="modal-backdrop" onClick={()=>setSelected(null)}><div className="modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setSelected(null)}><X/></button><div className="eyebrow">SAVE YOUR SPOT</div><h2>Register for {selected.title}</h2><p className="modal-desc">{selected.date} · {selected.venue}</p><form onSubmit={register}><label>Full name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name"/></label><label>Email address<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label><button className="primary-btn full" type="submit">Confirm registration <span>↗</span></button></form><small className="form-hint">Registration is saved when the backend is connected to MongoDB.</small></div></div>}
    {showAdmin && <div className="modal-backdrop" onClick={()=>setShowAdmin(false)}><div className="modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setShowAdmin(false)}><X/></button><div className="eyebrow">ORGANIZER STUDIO</div><h2>Create a campus event</h2><p className="modal-desc">Add the details below to publish an event.</p><form onSubmit={createEvent}><label>Event title<input required value={newEvent.title} onChange={e=>setNewEvent({...newEvent,title:e.target.value})} placeholder="e.g. Design thinking workshop"/></label><label>Category<select value={newEvent.category} onChange={e=>setNewEvent({...newEvent,category:e.target.value})}><option>Technology</option><option>Cultural</option><option>Workshop</option><option>Hackathon</option><option>Sports</option></select></label><label>Date<input type="date" required value={newEvent.date} onChange={e=>setNewEvent({...newEvent,date:e.target.value})}/></label><label>Venue<input required value={newEvent.venue} onChange={e=>setNewEvent({...newEvent,venue:e.target.value})} placeholder="Event venue"/></label><label>Description<textarea value={newEvent.description} onChange={e=>setNewEvent({...newEvent,description:e.target.value})} placeholder="What is the event about?"/></label><label>Capacity<input type="number" min="1" value={newEvent.capacity} onChange={e=>setNewEvent({...newEvent,capacity:e.target.value})}/></label><button className="primary-btn full" type="submit">Publish event <span>↗</span></button></form><small className="form-hint">Academic demo: organizer access is not password-protected.</small></div></div>}
  </div>;
}
createRoot(document.getElementById("root")).render(<App/>);
