// ChatWindow.tsx
import React, {useEffect, useState} from "react";
import axios from "axios";
import {ChatGroup, Message} from "../types";

interface Props {
    group: ChatGroup;
}

const ChatWindow: React.FC<Props> = ({group}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");

    const fetchMessages = async () => {
        const res = await axios.get<Message[]>(`/api/chat/groups/${group.id}/messages`);
        setMessages(res.data);
    };

    useEffect(() => {
        fetchMessages();
    }, [group]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        await axios.post(`/api/chat/groups/${group.id}/messages`, {
            content: newMessage,
        });
        setNewMessage("");
        fetchMessages();
    };

    return (
        <div className="flex flex-col h-full border rounded p-4">
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {messages.map((msg) => (
                    <div key={msg.id} className="p-2 bg-gray-100 rounded">
                        <strong>{msg.senderName}: </strong>
                        {msg.content}
                    </div>
                ))}
            </div>
            <form onSubmit={handleSend} className="flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Écrire un message..."
                    className="flex-1 border p-2 rounded"
                    required
                />
                <button
                    type="submit"
                    className="bg-emerald-600 text-white px-4 rounded hover:bg-emerald-700"
                >
                    Envoyer
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
