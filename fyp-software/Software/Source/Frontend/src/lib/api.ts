/**
 * API client for the Flask backend.
 * Uses VITE_API_URL (e.g. http://localhost:5000/api).
 */

const getBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  if (url) return url.replace(/\/$/, "");
  return "http://localhost:5000/api";
};

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken() {
  return authToken ?? localStorage.getItem("iot_token");
}

async function request<T>(
  path: string,
  options: RequestInit & { params?: Record<string, string> } = {}
): Promise<T> {
  const { params, ...init } = options;
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...((init.headers as Record<string, string>) ?? {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let url = `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  if (params && Object.keys(params).length > 0) {
    const search = new URLSearchParams(params).toString();
    url += (url.includes("?") ? "&" : "?") + search;
  }

  const res = await fetch(url, {
    ...init,
    headers: {
      ...headers,
      ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(init.headers as Record<string, string>),
    },
  });

  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const errObj = data as { error?: string; details?: string; msg?: string } | null;
    const err = errObj?.details
      ? `${errObj.error || "Error"}: ${errObj.details}`
      : errObj?.error || errObj?.msg || res.statusText;
    throw new Error(err);
  }
  return data as T;
}

// --- Auth ---
export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: { id: string; fullName: string; email: string; role: string; institution: string };
}

export function authLogin(email: string, password: string) {
  return request<LoginResponse>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function authRegister(data: {
  fullName: string;
  email: string;
  password: string;
  institution: string;
  researchPurpose: string;
}) {
  return request<{ message: string; userId: string }>("/register", {
    method: "POST",
    body: JSON.stringify({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      institution: data.institution,
      researchPurpose: data.researchPurpose,
    }),
  });
}

export function authLogout() {
  return request<{ message: string }>("/logout", { method: "POST" });
}

export function authMe() {
  return request<LoginResponse["user"]>("/me");
}

// --- Nodes ---
export interface NodeItem {
  id: string;
  mac_address?: string;
  status: string;
  ip: string;
  firmware: string;
  battery: number | null;
  lastActive: string;
  experiment: string;
  temperature?: number | null;
  humidity?: number | null;
  light?: number | null;
}

export function nodesList() {
  return request<NodeItem[]>("/nodes");
}

export function nodesAvailable() {
  return request<{ id: string; status: string }[]>("/nodes/available");
}

export function nodeUpdate(nodeId: string, data: Partial<{ status: string; ipAddress: string; firmwareVersion: string; batteryLevel: number }>) {
  return request<NodeItem>(`/nodes/${nodeId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function nodeCreate(data: { nodeId: string; macAddress?: string; status?: string; ipAddress?: string; firmwareVersion?: string; batteryLevel?: number }) {
  return request<NodeItem>(`/nodes`, {
    method: "POST",
    body: JSON.stringify({ ...data, nodeId: data.nodeId }),
  });
}

export function nodeDelete(nodeId: string) {
  return request<{ message: string }>(`/nodes/${nodeId}`, { method: "DELETE" });
}

// --- Experiments ---
export interface ExperimentItem {
  id: number;
  name: string;
  description: string;
  startTime: string | null;
  endTime: string | null;
  userId: number;
  nodeIds: string[];
  createdAt: string | null;

  status?: string;
}

export function experimentsList() {
  return request<ExperimentItem[]>("/experiments");
}

export function experimentGet(id: number) {
  return request<ExperimentItem>(`/experiments/${id}`);
}

export function experimentCreate(form: FormData) {
  return request<ExperimentItem>("/experiments", {
    method: "POST",
    body: form,
  });
}

export function experimentDelete(id: number) {
  return request<{ message: string }>(`/experiments/${id}`, { method: "DELETE" });
}

// --- Deploy ---
export function deployStart(experimentId: number) {
  return request<{ deploymentId: number; experimentId: number; status: string; message: string }>(
    `/deploy/${experimentId}`,
    { method: "POST" }
  );
}

export interface DeployStatusNode {
  id: string;
  progress: number;
  status: string;
  error?: string | null;
  updatedAt?: string | null;
}

export function deployStatus(experimentId: number) {
  return request<{
    experimentId: number;
    deploymentId: number | null;
    status: string;
    startedAt?: string | null;
    completedAt?: string | null;
    nodes: DeployStatusNode[];
  }>(`/deploy/status/${experimentId}`);
}

export interface DeploymentLogEntry {
  experiment: string;
  experimentId: number;
  node: string;
  firmware: string;
  time: string | null;
  status: string;
  error: string;
}

export function deploymentsList() {
  return request<DeploymentLogEntry[]>("/deploy");
}

// --- Sensor data ---
export interface SensorDataPoint {
  timestamp: string | null;
  temperature: number | null;
  humidity: number | null;
  light: number | null;
}

export function sensorDataGet(nodeId: string, params?: { from?: string; to?: string; limit?: number }) {
  const search: Record<string, string> = {};
  if (params?.from) search.from = params.from;
  if (params?.to) search.to = params.to;
  if (params?.limit) search.limit = String(params.limit);
  const q = Object.keys(search).length ? "?" + new URLSearchParams(search).toString() : "";
  return request<SensorDataPoint[]>(`/sensor-data/${nodeId}${q}`);
}

// --- Admin ---
export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  institution: string;
  approved: boolean;
}

export function adminUsersList() {
  return request<AdminUser[]>("/admin/users");
}

export function adminApproveUser(userId: number) {
  return request<AdminUser>(`/admin/approve-user/${userId}`, { method: "PUT" });
}

export interface DashboardStats {
  totalNodes?: number;
  onlineNodes?: number;
  offlineNodes?: number;
  activeExperiments?: number;
  totalUsers?: number;
  systemHealth?: string;
  myActiveExperiments?: number;
  assignedNodes?: number;
}

export function adminStats() {
  return request<DashboardStats>("/admin/stats");
}
