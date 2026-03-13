import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

// In production, VITE_BACKEND_URL should be your Render backend origin (e.g. https://webnario-backend.onrender.com)
// In local dev, empty string means same origin — Vite proxies /socket.io → localhost:5000
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";
const API_BASE = import.meta.env.VITE_API_URL || "/api";

export interface ChatMessage {
    _id: string;
    projectId: string;
    senderEmail: string;
    senderName: string;
    isAdmin: boolean;
    text: string;
    timestamp: string;
}

export function useChat(projectId: string | null) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [connected, setConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    // Load history via REST when projectId changes
    useEffect(() => {
        if (!projectId) return;
        const token = localStorage.getItem("webnario_token");
        if (!token) return;

        fetch(`${API_BASE}/chat/${projectId}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((data: ChatMessage[]) => {
                if (Array.isArray(data)) setMessages(data);
            })
            .catch(() => { });
    }, [projectId]);

    // Connect socket
    useEffect(() => {
        const token = localStorage.getItem("webnario_token");
        if (!token) return;

        const socket = io(BACKEND_URL, {
            auth: { token },
            transports: ["websocket"],
        });

        socketRef.current = socket;

        socket.on("connect", () => setConnected(true));
        socket.on("disconnect", () => setConnected(false));
        socket.on("receive_message", (msg: ChatMessage) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // Join room when projectId changes
    useEffect(() => {
        if (!projectId || !socketRef.current) return;
        socketRef.current.emit("join_room", { projectId });
    }, [projectId, connected]);

    const sendMessage = useCallback(
        (text: string) => {
            if (!projectId || !socketRef.current || !text.trim()) return;
            socketRef.current.emit("send_message", { projectId, text });
        },
        [projectId]
    );

    return { messages, sendMessage, connected };
}
