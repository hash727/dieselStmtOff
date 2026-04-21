import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true, //allows existing email to link
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    // Do NOT include Credentials or Prisma here
  ],
  callbacks: {
    // 1. firs, add data to the JWT token when logging in
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        // Map multiple offices and default active office from the user object
        // (These fields must be included in authorize return)
        const primaryOfficeId = 
          (user as any).activeOfficeId || 
          (user as any).officeId ||
          (user as any).offices?.[0]?.id;
        
        token.activeOfficeId = primaryOfficeId;
        token.officeId = primaryOfficeId;
        // token.assignedOffices = (user as any).offices || [];
        const dbOffices = (user as any).offices || [];

        if(dbOffices.length === 0 && primaryOfficeId){
          token.assignedOffices = [{id: primaryOfficeId}];
        } else {
          token.assignedOffices = dbOffices;
        }
      }


      // Handle the manual "update" trigger from the server action
      if (trigger === "update" && session?.user) {
        if(session.user){
          if(session.user.role) token.role = session.user.role;
          if(session.user.assignedOffices){
            token.assignedOffices = session.user.assignedOffices;
          }
          // Ensure officeId and activeOfficeId are identical in the token
          const newId = session.user.activeOfficeId || session.user.officeId;
          if(newId){
            token.activeOfficeId = newId;
            token.officeId = newId; 
          }
        }

        // Handle specific activeOfficeId update
        if (session.activeOfficeId) {
          token.activeOfficeId = session.activeOfficeId;
          token.officeId = session.activeOfficeId;
        }
      }

      // When update {activeOfficeId: '...' } is called on client
      if(trigger === "update" && session?.activeOfficeId){
        token.activeOfficeId = session.activeOfficeId
      }


      return token;
    },

    // 2. Then, pass that data from the token to the session
    async session({ session, token }) {
      // Transfer the custom fields from teh database user to the session
      if (session && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "USER" | "MANAGER";

        // Sync the new multi-office properties to the session
        session.user.assignedOffices = (token.assignedOffices as any[]) || []
        session.user.activeOfficeId = token.activeOfficeId as string | undefined;
        session.user.officeId = token.activeOfficeId as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
