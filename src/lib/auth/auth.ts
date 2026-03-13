import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // This is a placeholder for actual email/password authentication
        // Here we just check for a generic domain as per requirements
        
        if (!credentials?.email || !credentials?.password) return null

        // Domain restriction check (e.g., @company.co.jp)
        // For MVP, we allow a configurable domain from env, fallback to example.com
        const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || 'example.com'
        
        if (!credentials.email.endsWith(`@${allowedDomain}`)) {
          throw new Error('Unauthorized domain')
        }

        // Mock user for MVP since no users table exists yet
        const user = { id: "1", name: "Mock User", email: credentials.email, role: "ADMIN" }
        return user
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role
      }
      return session
    }
  },
  pages: {
    signIn: '/login', // Optional custom login page
  }
}

export default NextAuth(authOptions)
