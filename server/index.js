import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(",") || true }));
app.use(express.json());

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: { type: String, default: "College Event" },
  date: { type: String, required: true },
  venue: { type: String, required: true },
  description: { type: String, default: "" },
  capacity: { type: Number, default: 100 },
  createdAt: { type: Date, default: Date.now }
});
const registrationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  createdAt: { type: Date, default: Date.now }
});
registrationSchema.index({ eventId: 1, email: 1 }, { unique: true });

const Event = mongoose.model("Event", eventSchema);
const Registration = mongoose.model("Registration", registrationSchema);

const demoEvents = [
  { _id: "demo-ai-1", title: "AI & Innovation Summit", category: "Technology", date: "2026-10-20", venue: "Central Auditorium", description: "Talks and demos on practical AI and student innovation.", capacity: 150 },
  { _id: "demo-cultural-2", title: "Campus Cultural Fest", category: "Cultural", date: "2026-10-25", venue: "College Grounds", description: "A celebration of music, art, dance and student talent.", capacity: 300 },
  { _id: "demo-hack-3", title: "Buildathon 2026", category: "Hackathon", date: "2026-11-02", venue: "Innovation Lab", description: "Collaborate in teams and build a prototype for a real problem.", capacity: 80 }
];
let mongoConnected = false;

app.get("/api/health", (_req, res) => res.json({ ok: true, database: mongoConnected ? "connected" : "demo-mode" }));

app.get("/api/events", async (_req, res) => {
  try {
    if (!mongoConnected) return res.json(demoEvents);
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) { res.status(500).json({ message: "Could not fetch events." }); }
});

app.post("/api/events", async (req, res) => {
  try {
    const { title, category, date, venue, description, capacity } = req.body;
    if (!title?.trim() || !date || !venue?.trim()) return res.status(400).json({ message: "Title, date and venue are required." });
    if (!mongoConnected) {
  const event = {
    _id: `demo-${Date.now()}`,
    title: title.trim(),
    category: category || "College Event",
    date,
    venue: venue.trim(),
    description: description || "",
    capacity: Number(capacity) || 100
  };

  demoEvents.push(event);
  return res.status(201).json(event);
}

const event = await Event.create({
  title,
  category,
  date,
  venue,
  description,
  capacity: Number(capacity) || 100
});
res.status(201).json(event);
  } catch (err) { res.status(500).json({ message: "Could not create event." }); }
});

app.post("/api/registrations", async (req, res) => {
  try {
    const { eventId, name, email } = req.body;
    if (!eventId || !name?.trim() || !email?.trim()) return res.status(400).json({ message: "Name and email are required." });
    if (!mongoConnected) return res.status(503).json({ message: "Connect MongoDB to save registrations. Demo mode is currently read-only." });
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found. Demo events cannot be registered until saved in MongoDB." });
    const registration = await Registration.create({ eventId, name, email });
    res.status(201).json({ message: "Registration successful!", registration });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "This email is already registered for this event." });
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
});

app.get("/api/events/:id/registrations", async (req, res) => {
  try {
    if (!mongoConnected) return res.json([]);
    const registrations = await Registration.find({ eventId: req.params.id }).sort({ createdAt: -1 });
    res.json(registrations);
  } catch (err) { res.status(500).json({ message: "Could not fetch registrations." }); }
});

async function start() {
  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes("YOUR_USERNAME")) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      mongoConnected = true;
      console.log("MongoDB connected.");
    } catch (err) {
      console.error("MongoDB connection failed; starting in demo mode:", err.message);
    }
  } else {
    console.log("No MongoDB URI configured; starting in demo mode (read-only sample events).");
  }
  app.listen(PORT, () => console.log(`EventSphere API running on port ${PORT}`));
}
start();
