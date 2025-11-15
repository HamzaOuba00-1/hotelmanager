import axios from "./axios";
import type { Channel, ChatMessage, ChannelType } from "../types/Chat";
import type { User } from "../types/User";

const authHeader = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

export async function listChannels(): Promise<Channel[]> {
  const { data } = await axios.get<Channel[]>("/channels", authHeader());
  return data;
}

export async function createChannel(payload: {
  type: ChannelType;
  name: string;
  service?: string;
  icon?: string;
  crewId?: number;
  memberIds?: number[];
}): Promise<Channel> {
  const body: any = { type: payload.type, name: payload.name };
  if (payload.service) body.service = payload.service;
  if (payload.icon) body.icon = payload.icon;
  if (payload.type === "CREW" && payload.crewId) body.crewId = payload.crewId;
  if (payload.type !== "CREW" && payload.memberIds?.length) body.memberIds = payload.memberIds;

  const { data } = await axios.post<Channel>("/channels", body, authHeader());
  return data;
}

export async function updateChannel(
  id: number,
  payload: { name?: string; service?: string; icon?: string }
): Promise<Channel> {
  const clean: any = {};
  if (payload.name) clean.name = payload.name;
  if (payload.service) clean.service = payload.service;
  if (payload.icon) clean.icon = payload.icon;

  const { data } = await axios.put<Channel>(`/channels/${id}`, clean, authHeader());
  return data;
}

export async function replaceChannelMembers(
  id: number,
  memberIds: number[]
): Promise<Channel> {
  const { data } = await axios.put<Channel>(
    `/channels/${id}/members`,
    memberIds,
    authHeader()
  );
  return data;
}

export async function deleteChannel(id: number): Promise<void> {
  await axios.delete(`/channels/${id}`, authHeader());
}

export async function getMessages(channelId: number, limit = 50): Promise<ChatMessage[]> {
  const { data } = await axios.get<ChatMessage[]>(
    `/channels/${channelId}/messages`,
    { params: { limit }, ...authHeader() }
  );
  return data;
}

export async function sendMessage(channelId: number, content: string): Promise<ChatMessage> {
  const { data } = await axios.post<ChatMessage>(
    `/channels/${channelId}/messages`,
    { content },
    authHeader()
  );
  return data;
}

export async function getChannelMembers(channelId: number): Promise<User[]> {
  const { data } = await axios.get<User[]>(
    `/channels/${channelId}/members`,
    authHeader()
  );
  return data;
}
