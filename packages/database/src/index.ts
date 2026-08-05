export { prisma } from "./client";
export type { Prisma } from "@prisma/client";

export type {
  Tenant,
  User,
  Area,
  Subject,
  AreaSubjectCandidate,
  DailyAreaSubject,
  UserArea,
  UserDailyItem,
  InaccuracyReport,
  AuditLog,
  AnalyticsEvent,
} from "@prisma/client";

export {
  Role,
  TenantStatus,
  UserStatus,
  AreaStatus,
  SubjectSource,
  SubjectStatus,
  CandidateStatus,
  DailySubjectStatus,
  UserDailyItemStatus,
  ReportReason,
  ReportStatus,
} from "@prisma/client";
