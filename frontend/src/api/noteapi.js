const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/notes";

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
    }
    return response.json();
};

// GET ALL
export const getNotes = async () => {
    const response = await fetch(BASE_URL);
    return handleResponse(response);
};

// CREATE
export const createNote = async (title, content) => {
    const response = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content })
    });
    return handleResponse(response);
};

// UPDATE
export const updateNote = async (id, updates) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
    });
    return handleResponse(response);
};

// DELETE
export const deleteNoteApi = async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE"
    });
    return handleResponse(response);
};