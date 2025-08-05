// GroupList.tsx
import React from "react";
import {ChatGroup} from "../types";

interface Props {
    groups: ChatGroup[];
    onSelect: (group: ChatGroup) => void;
}

const GroupList: React.FC<Props> = ({groups, onSelect}) => {
    return (
        <div className="space-y-2">
            {groups.map((group) => (
                <button
                    key={group.id}
                    onClick={() => onSelect(group)}
                    className="w-full text-left border p-2 rounded hover:bg-gray-100"
                >
                    {group.name}
                </button>
            ))}
        </div>
    );
};

export default GroupList;