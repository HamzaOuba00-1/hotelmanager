import axios from "../../../api/axios";

export type IssueStatus = "OPEN" | "RESOLVED" | "DELETED";

export interface Issue {
  id: number;
  title: string;
  description: string;
  important: boolean;
  status: IssueStatus;
  createdAt: string;      // ISO date
  updatedAt: string;      // ISO date
  resolvedAt?: string | null;
  hotelId?: number | null;
  createdById?: number | null;
  createdByName?: string | null;
}

export interface IssueInput {
  title: string;
  description: string;
  important?: boolean;
}

export interface IssueStatusUpdateRequest {
  status?: IssueStatus;
  important?: boolean;
}

/**
 * Tous les signalements pour l’hôtel de l’utilisateur connecté
 * (backend : GET /api/issues/my-hotel)
 */
export const getIssuesForMyHotel = () => {
  return axios.get<Issue[]>("/api/issues/my-hotel");
};

/**
 * (Optionnel) Tous les signalements d’un hôtel donné
 * (backend : GET /api/issues/hotel/{hotelId})
 */
export const getIssuesByHotel = (hotelId: number) => {
  return axios.get<Issue[]>(`/api/issues/hotel/${hotelId}`);
};

/**
 * Détail d’un issue
 */
export const getIssueById = (id: number) => {
  return axios.get<Issue>(`/api/issues/${id}`);
};

/**
 * Création d’un nouveau signalement (employé ou manager)
 */
export const createIssue = (payload: IssueInput) => {
  return axios.post<Issue>("/api/issues", payload);
};

/**
 * MAJ du status / important (manager)
 */
export const updateIssueStatus = (
  id: number,
  body: IssueStatusUpdateRequest
) => {
  return axios.patch<Issue>(`/api/issues/${id}/status`, body);
};

/**
 * Soft delete (manager)
 */
export const deleteIssue = (id: number) => {
  return axios.delete(`/api/issues/${id}`);
};
