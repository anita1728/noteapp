import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
// import { fileURLToPath } from "url";
import mongoose from "mongoose";
import cors from "cors";


const app = express();
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
const PORT = 3000;


// app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(cors());

// ------------------
// __dirname Fix (ESM)
// ------------------


// ------------------
// MongoDB Connection
// ------------------
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB Atlas Connected"))
    .catch(err => {
        console.error("MongoDB connection error:", err);
        process.exit(1); // stop server if DB fails
    });
// ------------------
// Schema & Model
// ------------------
const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    }
});

const Todo = mongoose.model("Todo", todoSchema);

// ------------------
// ROUTES
// ------------------

// READ ALL
app.get("/api/notes", async (req, res) => {
    try {
        const todos = await Todo.find().sort({ createdAt: -1 });
        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// CREATE
app.post("/api/notes", async (req, res) => {
    try {
        const { title } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ message: "Title is required" });
        }

        const newTodo = await Todo.create({ title: title.trim() });
        res.status(201).json(newTodo);

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// UPDATE (toggle or custom update)
app.put("/api/notes/:id", async (req, res) => {
    try {
        const { title, completed } = req.body;

        const todo = await Todo.findById(req.params.id);
        if (!todo) {
            return res.status(404).json({ message: "Todo not found" });
        }

        if (title !== undefined) {
            if (!title.trim()) {
                return res.status(400).json({ message: "Title cannot be empty" });
            }
            todo.title = title.trim();
        }

        if (completed !== undefined) {
            todo.completed = completed;
        }

        await todo.save();
        res.json(todo);

    } catch (error) {
        res.status(400).json({ message: "Invalid ID" });
    }
});

// DELETE
app.delete("/api/notes/:id", async (req, res) => {
    try {
        const deleted = await Todo.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: "Todo not found" });
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