const BASE_URL = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
    const response = await fetch(`${BASE_URL}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });

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

export function getHistory(userID) {
    return request(`/chat/${encodeURIComponent(userID)}`);
}

export function sendMessage(userID, prompt) {
    return request('/chat', {
        method: 'POST',
        body: JSON.stringify({ userID, prompt }),
    });
}

export function clearHistory(userID) {
    return request(`/chat/${encodeURIComponent(userID)}`, {
        method: 'DELETE',
    });
}
