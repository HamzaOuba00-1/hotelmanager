// ChatApp.tsx
import React, {useEffect, useState} from "react";
import GroupCreateForm from "./GroupCreateForm";
import GroupList from "./GroupList";
import ChatWindow from "./ChatWindow";
import {ChatGroup} from "../types";
import axios from "axios";

const ChatApp: React.FC = () => {
    const [groups, setGroups] = useState<ChatGroup[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);

    const fetchGroups = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.warn("Aucun token trouvé");
            return;
        }

        try {
            const res = await axios.get<ChatGroup[]>("/api/chat/groups", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setGroups(res.data);
        } catch (err) {
            console.error("Erreur lors du chargement des groupes :", err);
        }
    };


    useEffect(() => {
        fetchGroups();
    }, []);

    return (
        <div className="flex gap-6 p-6 h-screen">
            <div className="w-1/4 space-y-4">
                <GroupCreateForm onGroupCreated={fetchGroups}/>
                <GroupList groups={groups} onSelect={setSelectedGroup}/>
            </div>
            <div className="flex-1">
                {selectedGroup ? (
                    <ChatWindow group={selectedGroup}/>
                ) : (
                    <p className="text-gray-500">Sélectionnez un groupe</p>
                )}
            </div>
        </div>
    );
};

export default ChatApp;