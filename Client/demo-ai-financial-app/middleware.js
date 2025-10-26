import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
]);

// Create Clerk middleware with demo path detection
const clerk = clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Check if user is on a demo page
  const isDemo = req.nextUrl.pathname.startsWith("/demo");
  const res = NextResponse.next();

  if (isDemo) {
    res.headers.set("x-in-demo", "true");
  }

  if (!userId && isProtectedRoute(req)) {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }

  return res;
});

// Export only the Clerk middleware
export default clerk;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

export const runtime = "edge";
