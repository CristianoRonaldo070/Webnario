import { useEffect, useRef, useState } from "react";
import { X, Send, MessageSquareText, Wifi, WifiOff } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
    projectId: string;
    projectName: string;
    currentUserEmail: string;
    onClose: () => void;
}

function formatTimestamp(ts: string) {
    const d = new Date(ts);
    const date = d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
    const time = d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
    return `${date}, ${time}`;
}

const ChatWindow = ({ projectId, projectName, currentUserEmail, onClose }: Props) => {
    const { messages, sendMessage, connected } = useChat(projectId);
    const [input, setInput] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        sendMessage(input.trim());
        setInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[95vw] flex flex-col rounded-2xl shadow-2xl border border-border bg-background overflow-hidden"
            style={{ height: "520px" }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
                <div className="flex items-center gap-2 min-w-0">
                    <MessageSquareText className="h-5 w-5 shrink-0" />
                    <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{projectName}</p>
                        <div className="flex items-center gap-1 text-xs opacity-80">
                            {connected ? (
                                <>
                                    <Wifi className="h-3 w-3" />
                                    <span>Live</span>
                                </>
                            ) : (
                                <>
                                    <WifiOff className="h-3 w-3" />
                                    <span>Connecting...</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                    onClick={onClose}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                        <MessageSquareText className="h-10 w-10 opacity-30" />
                        <p>No messages yet. Say hello!</p>
                    </div>
                )}
                {messages.map((msg) => {
                    const isMe = msg.senderEmail === currentUserEmail;
                    return (
                        <div
                            key={msg._id}
                            className={`flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${isMe
                                        ? "bg-primary text-primary-foreground rounded-br-sm"
                                        : "bg-card border border-border rounded-bl-sm"
                                    }`}
                            >
                                {!isMe && (
                                    <p className="text-xs font-semibold mb-0.5 opacity-70">
                                        {msg.isAdmin ? "👑 Admin" : msg.senderName}
                                    </p>
                                )}
                                <p className="break-words leading-relaxed">{msg.text}</p>
                            </div>
                            <span className="text-[10px] text-muted-foreground px-1">
                                {formatTimestamp(msg.timestamp)}
                            </span>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 px-3 py-3 border-t border-border bg-background">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 text-sm bg-muted/50 rounded-xl px-3 py-2 outline-none border border-border focus:border-primary transition-colors placeholder:text-muted-foreground"
                />
                <Button
                    size="icon"
                    className="h-9 w-9 rounded-xl shrink-0"
                    onClick={handleSend}
                    disabled={!input.trim() || !connected}
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </motion.div>
    );
};

export default ChatWindow;
