export type Status = "PENDING" | "HOLD" | "PASSED" | "REJECTED";

export type Gender = "MALE" | "FEMALE";

export interface Participant {
  id: string;
  lotNumber: string;
  athleteName: string;
  academyName: string;
  gender: string;
  division: string;
  ageGroup: string;
  category: string;
  weightCategory: string;
  athleteId?: string | null;
  currentStatus: Status;
  currentWeight?: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  attempts?: WeighInAttempt[];
  auditLogs?: AuditLog[];
}

export interface WeighInAttempt {
  id: string;
  participantId: string;
  attemptNumber: number;
  weight: number;
  status: Status;
  operatorId: string;
  notes?: string | null;
  weighedAt: string | Date;
  createdAt: string | Date;
}

export interface AuditLog {
  id: string;
  participantId: string;
  action: string;
  previousStatus: Status;
  newStatus: Status;
  weight?: number | null;
  operatorId: string;
  details?: string | null;
  timestamp: string | Date;
  participant?: {
    athleteName: string;
    lotNumber: string;
  };
}

export interface CategorySummary {
  id: string; // e.g., "MALE-Senior-18+-Kyorugi-Under 54 KG"
  gender: string;
  division: string;
  ageGroup: string;
  category: string;
  weightCategory: string;
  label: string; // "Senior Male Kyorugi Under 54 KG"
  total: number;
  passed: number;
  pending: number;
  hold: number;
  rejected: number;
  completionRate: number;
}

export interface ImportPreviewRow {
  rowNumber: number;
  lotNumber: string;
  athleteName: string;
  academyName: string;
  gender: string;
  division: string;
  ageGroup: string;
  category: string;
  weightCategory: string;
  athleteId?: string;
  isValid: boolean;
  errors: string[];
}

export interface ImportSummary {
  totalRows: number;
  validCount: number;
  errorCount: number;
  duplicateLotsInFile: string[];
  duplicateLotsInDb: string[];
  rows: ImportPreviewRow[];
}
