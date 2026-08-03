import type { Role } from "@dailycurio/database";
import type { DefaultSession } from "@auth/core/types";

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    hasAreas?: boolean;
  }
}

declare module "@auth/core/types" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
    hasAreas?: boolean;
  }

  interface User {
    role?: Role;
  }
}
