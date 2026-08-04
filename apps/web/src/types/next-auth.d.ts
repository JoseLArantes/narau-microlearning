import type { Role } from "@narau/database";
import type { DefaultSession } from "@auth/core/types";

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    tenantId?: string;
    hasAreas?: boolean;
  }
}

declare module "@auth/core/types" {
  interface Session {
    user: {
      id: string;
      role: Role;
      tenantId?: string;
    } & DefaultSession["user"];
    hasAreas?: boolean;
  }

  interface User {
    role?: Role;
  }
}
