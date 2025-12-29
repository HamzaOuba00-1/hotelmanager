export type ChannelType = "CREW" | "DIRECT" | "ANNOUNCEMENT";

export type Channel = {
  id: number;
  name: string;
  type: ChannelType;
  service?: string | null;
  icon?: string | null;
  hotelId: number;
  crewId?: number | null;
  createdBy?: number | null;
  createdAt: string;
  memberCount: number;
};

export type ChatMessage = {
  id: number;
  channelId: number;
  senderId: number;
  senderFirstName: string;   
  senderLastName: string;    
  type: string;
  content: string;
  createdAt: string;
  editedAt?: string | null;
  softDeleted: boolean;
};

