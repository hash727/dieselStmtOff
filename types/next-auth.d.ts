import NextAuth, { type DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    role?: "ADMIN" | "USER" | "MANAGER"
    activeOfficeId?: string | null
  }

  // The shape of the user object in the session

  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "USER" | "MANAGER";
      officeId: string;
      activeOfficeId?: string;
      assignedOffices: any[];
    } & DefaultSession["user"];
  }

  // The shape of the user object returned form the database

  // interface User {
  //   id?: string;
  //   officeId?: string;
  // }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "ADMIN" | "USER" | "MANAGER";
    activeOfficeId?: string | null;
    assignedOffices: any[];
  }
}
