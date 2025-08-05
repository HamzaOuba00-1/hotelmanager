// types.ts
export interface ChatGroup {
    id: number;
    name: string;
}

export interface Message {
    id: number;
    content: string;
    senderName: string;
    timestamp: string;
}