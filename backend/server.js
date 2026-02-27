import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// ------------------
// MongoDB Connection
// ------------------

const connectDB = async () => {
    const cloudUrl = process.env.MONGO_URL;
    const localUrl = "mongodb://127.0.0.1:27017/note_app";

    let urlToConnect = cloudUrl;

    if (!cloudUrl || cloudUrl.includes("<username>")) {
        console.log("No cloud MONGO_URL found, attempting local connection...");
        urlToConnect = localUrl;
    }

    try {
        await mongoose.connect(urlToConnect);
        console.log(`MongoDB Connected: ${urlToConnect === localUrl ? "Local" : "Cloud"}`);
    } catch (err) {
        console.error("Database Connection Error:", err.message);
        if (urlToConnect === localUrl) {
            console.log("TIP: Ensure your local MongoDB service is running (e.g., 'net start MongoDB') or provide a valid cloud MONGO_URL in .env");
        } else {
            console.log("TIP: Check your cloud MONGO_URL in .env");
        }
    }
};

connectDB();

// ------------------
// Schema & Model
// ------------------
const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    }
});

const Note = mongoose.model("Note", noteSchema);

// ------------------
// ROUTES
// ------------------

// READ ALL
app.get("/api/notes", async (req, res) => {
    try {
        const notes = await Note.find().sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// CREATE
app.post("/api/notes", async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content || !title.trim() || !content.trim()) {
            return res.status(400).json({ message: "Title and content are required" });
        }

        const newNote = await Note.create({ title: title.trim(), content: content.trim() });
        res.status(201).json(newNote);

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// UPDATE
app.put("/api/notes/:id", async (req, res) => {
    try {
        const { title, content } = req.body;

        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        if (title !== undefined) note.title = title.trim();
        if (content !== undefined) note.content = content.trim();

        await note.save();
        res.json(note);

    } catch (error) {
        res.status(400).json({ message: "Invalid ID" });
    }
});

// DELETE
app.delete("/api/notes/:id", async (req, res) => {
    try {
        const deleted = await Note.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: "Note not found" });
        }

        res.json({ message: "Deleted successfully" });

    } catch (error) {
        res.status(400).json({ message: "Invalid ID" });
    }
});

// ------------------
// SERVER START
// ------------------
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});