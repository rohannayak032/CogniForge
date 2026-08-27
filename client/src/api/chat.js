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

export function getHistory(conversationID, userID) {
    return getConversation(conversationID, userID);
}

export function createConversation(userID) {
    return request('/chat/conversations', {
        method: 'POST',
        body: JSON.stringify({ userID }),
    });
}

export function getConversations(userID) {
    return request(`/chat/conversations/${encodeURIComponent(userID)}`);
}

export function getConversation(conversationID, userID) {
    const path = `/chat/conversations/${encodeURIComponent(conversationID)}?userID=${encodeURIComponent(userID)}`;
    return request(path);
}

export function deleteConversation(conversationID, userID) {
    return request(`/chat/conversations/${encodeURIComponent(conversationID)}`, {
        method: 'DELETE',
        body: JSON.stringify({ userID }),
    });
}

export function sendMessage(userID, prompt, conversationID) {
    return request('/chat', {
        method: 'POST',
        body: JSON.stringify({ userID, prompt, conversationID }),
    });
}

export function clearHistory(userID) {
    return request(`/chat/${encodeURIComponent(userID)}`, {
        method: 'DELETE',
    });
}
