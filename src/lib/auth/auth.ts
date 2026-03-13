import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import { members } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // Domain restriction check
        const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || 'example.com'
        if (!credentials.email.endsWith(`@${allowedDomain}`)) {
          throw new Error('Unauthorized domain')
        }

        // Fetch real member from DB
        const [member] = await db
          .select()
          .from(members)
          .where(eq(members.email, credentials.email))
          .limit(1)

        if (!member) {
          // For early stage, if user doesn't exist but has valid domain, 
          // we might want to auto-create them, but for now we'll just require them to exist
          // Or let's auto-create a basic member if they have a valid domain for easier testing
          const [newMember] = await db.insert(members).values({
            name: credentials.email.split('@')[0],
            email: credentials.email,
            avatarColor: "#6366f1", // Default color
          }).returning()
          
          return {
            id: newMember.id,
            name: newMember.name,
            email: newMember.email,
            image: newMember.avatarUrl,
            avatarColor: newMember.avatarColor,
            role: "ADMIN"
          }
        }

        return { 
          id: member.id, 
          name: member.name, 
          email: member.email, 
          image: member.avatarUrl,
          avatarColor: member.avatarColor,
          role: "ADMIN" 
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.avatarColor = (user as any).avatarColor
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).avatarColor = token.avatarColor;
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  }
}

export default NextAuth(authOptions)
