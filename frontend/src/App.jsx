import "./App.css";
import { useState, useEffect } from "react";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNoteApi
} from "./api/noteapi";

function App() {
  const [notes, setNotes] = useState([]);
  const [inputTitle, setInputTitle] = useState("");
  const [inputContent, setInputContent] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load notes on mount
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const data = await getNotes();
      setNotes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async () => {
    if (!inputTitle.trim() || !inputContent.trim()) return;

    try {
      const newNote = await createNote(inputTitle, inputContent);
      setNotes([newNote, ...notes]);
      setInputTitle("");
      setInputContent("");
    } catch (err) {
      setError(err.message);
    }
  };

  const editNote = async (note) => {
    const updatedTitle = prompt("Edit Title", note.title);
    const updatedContent = prompt("Edit Content", note.content);

    if (updatedTitle && updatedContent) {
      try {
        const updatedNote = await updateNote(note._id, {
          title: updatedTitle,
          content: updatedContent
        });
        setNotes(notes.map(n => n._id === updatedNote._id ? updatedNote : n));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const deleteNote = async (id) => {
    try {
      await deleteNoteApi(id);
      setNotes(notes.filter(n => n._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <h2>Loading...</h2>;
  if (error) return <h2>Error: {error}</h2>;

  return (
    <div className="container">
      <h1>Notes App</h1>

      <div className="input-group">
        <input
          placeholder="Note Title"
          value={inputTitle}
          onChange={(e) => setInputTitle(e.target.value)}
        />
        <textarea
          placeholder="Note Content"
          value={inputContent}
          onChange={(e) => setInputContent(e.target.value)}
        />
        <button onClick={addNote}>Add Note</button>
      </div>

      <ul>
        {notes.map((note) => (
          <li key={note._id}>
            <h3>{note.title}</h3>
            <p>{note.content}</p>

            <div className="actions">
              <button className="btn-edit" onClick={() => editNote(note)}>
                Edit
              </button>
              <button className="btn-delete" onClick={() => deleteNote(note._id)}>
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;