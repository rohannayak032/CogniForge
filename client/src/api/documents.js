const BASE_URL = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
    const response = await fetch(`${BASE_URL}${path}`, options);
    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error(`Request failed with status ${response.status}`);
    }

    if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
}

export function uploadDocument(userID, file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userID', userID);

    return request('/documents', {
        method: 'POST',
        body: formData,
    });
}

export function getDocuments(userID) {
    return request(`/documents/${encodeURIComponent(userID)}`);
}

export function deleteDocument(userID, documentID) {
    return request(`/documents/${encodeURIComponent(documentID)}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userID }),
    });
}

export function askDocument(userID, query, documentID, topK = 5) {
    return request('/documents/ask', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userID, query, documentID, topK }),
    });
}
