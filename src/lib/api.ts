const API_BASE = import.meta.env.VITE_API_URL || '/api';

const getToken = (): string | null => localStorage.getItem('webnario_token');

const headers = (): HeadersInit => ({
    'Content-Type': 'application/json',
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

const handleResponse = async (res: Response) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
};

export const api = {
    post: (path: string, body: unknown) =>
        fetch(`${API_BASE}${path}`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handleResponse),

    get: (path: string) =>
        fetch(`${API_BASE}${path}`, { method: 'GET', headers: headers() }).then(handleResponse),

    patch: (path: string, body: unknown) =>
        fetch(`${API_BASE}${path}`, { method: 'PATCH', headers: headers(), body: JSON.stringify(body) }).then(handleResponse),

    delete: (path: string) =>
        fetch(`${API_BASE}${path}`, { method: 'DELETE', headers: headers() }).then(handleResponse),
};
