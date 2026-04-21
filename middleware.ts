import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);



export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;
  const role = session?.user?.role as string | undefined;
  const pathname = nextUrl.pathname;

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");

  // 1. Guest Handling
  if (!isLoggedIn) {
    return isAuthPage ? null : Response.redirect(new URL("/login", nextUrl));
  }

  if (role === "ADMIN") {
    // If Admin is logged in and tries to go to Login/Register, send to Dashboard Home
    if (isAuthPage) {
      return Response.redirect(new URL("/dashboard", nextUrl));
    }
    return null; // Admins can go anywhere else (Onboarding, Settings, etc.)
  }

  // 2. USER Role: Never allow onboarding
  if (role === "USER") {
    if (pathname.startsWith("/onboarding") || isAuthPage) {
      return Response.redirect(new URL("/dashboard/engine", nextUrl));
    }
    return null; 
  }

  // 3. ADMIN/STAFF: Handle Onboarding
  const hasOffices = (session?.user?.assignedOffices?.length || 0) > 0;
  if (role !== "MANAGER" && !hasOffices) {
    // If not on onboarding and not on auth, send to onboarding
    if (!pathname.startsWith("/onboarding") && !isAuthPage) {
       return Response.redirect(new URL("/onboarding", nextUrl));
    }
    return null;
  }

  // 4. Redirect away from Login if already logged in
  if (isAuthPage) {
    return Response.redirect(new URL("/dashboard/engine", nextUrl));
  }

  return null;
});



export const config = {
  // Protect all routes except auth pages and static files
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
