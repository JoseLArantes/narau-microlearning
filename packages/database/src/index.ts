export { prisma } from "./client";
export type { Prisma } from "@prisma/client";

export type {
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
