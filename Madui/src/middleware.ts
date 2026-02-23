import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/admin']
// Routes only for unauthenticated users
const authRoutes = ['/login', '/register']
// Routes that require admin role
const adminRoutes = ['/admin']

export async function middleware(request: NextRequest) {
    const { response, user } = await updateSession(request)
    const path = request.nextUrl.pathname

    // Check if the current path matches any protected route
    const isProtected = protectedRoutes.some(route => path.startsWith(route))
    const isAuthRoute = authRoutes.some(route => path.startsWith(route))
    const isAdminRoute = adminRoutes.some(route => path.startsWith(route))

    // Redirect unauthenticated users from protected routes to login
    if (isProtected && !user) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('next', path)
        return NextResponse.redirect(loginUrl)
    }

    // Redirect authenticated users from auth routes to dashboard
    if (isAuthRoute && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Check admin role for admin routes
    if (isAdminRoute && user) {
        const role = user.user_metadata?.role
        if (role !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
