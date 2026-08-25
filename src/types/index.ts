import type { User, Device, AiModel, Deployment, DeviceAlert, Notification, ApiKey, Webhook } from "@prisma/client";

export type { User, Device, AiModel, Deployment, DeviceAlert, Notification, ApiKey, Webhook };

export interface DeviceWithDetails extends Device {
  group?: { id: string; name: string; color?: string | null } | null;
  alerts?: DeviceAlert[];
  _count?: { sensorReadings: number; commands: number };
}

export interface AiModelWithDetails extends AiModel {
  trainingJobs?: Array<{ id: string; status: string; progress: number; accuracy?: number | null }>;
  _count?: { inferenceRequests: number; deployments: number };
}

export interface DeploymentWithDetails extends Deployment {
  model?: { name: string; type: string } | null;
  _count?: { logs: number };
}

export interface DashboardStats {
  totalDevices: number;
  onlineDevices: number;
  totalModels: number;
  deployedModels: number;
  activeDeployments: number;
  unreadAlerts: number;
}

export interface ChartDataPoint {
  time: string;
  value: number;
  value2?: number;
  label?: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  total?: number;
  page?: number;
  pages?: number;
}

export type DeviceStatus = "ONLINE" | "OFFLINE" | "WARNING" | "ERROR" | "MAINTENANCE";
export type ModelStatus = "DRAFT" | "TRAINING" | "TRAINED" | "DEPLOYED" | "ARCHIVED";
export type DeploymentStatus = "PENDING" | "DEPLOYING" | "RUNNING" | "STOPPED" | "FAILED" | "UPDATING";
export type AlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type UserRole = "USER" | "ADMIN" | "SUPERADMIN";
export type TeamRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
