import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define the routes that should be open to everyone
const isPublicRoute = createRouteMatcher([
  '/',
  '/api/upload',
  '/watch(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)'
]);

// FIX: Remove 'async' before (auth, req)
export default clerkMiddleware((auth, req) => {
  // If the incoming request is NOT a public route, require the user to log in.
  if (!isPublicRoute(req)) {
    // FIX: Remove 'await' and remove the '()' after auth
    // It is just auth.protect() now.
    auth.protect();
  }
});

export const config = {
  // The standard matcher regex required by Clerk
  matcher: [
    '/((?!.*\\..*|_next).*)', // Don't run on static files ending in .css, .js, etc
    '/',                      // Run on homepage
    '/(api|trpc)(.*)'         // Run on API routes
  ],
};