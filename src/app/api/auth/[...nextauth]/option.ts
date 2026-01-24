import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
// import { PrismaAdapter } from '@prisma/adapter-pg'
import { z } from 'zod'
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

  interface GoogleProfile {
  email_verified: boolean;
  email: string;
}

const credentialShema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(4, "Password to short")
})

export const authOptions: NextAuthOptions = {
    // adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "password", type: "password" }
            },
            async authorize(credentials: any): Promise<any> {
                try {
                    const parsed = credentialShema.safeParse(credentials)
                    if (!parsed.success) return null;

                    const { email, password } = parsed.data

                    const user = await prisma.user.findUnique({ where: { email } })
                    if (!user || !user.password) return null

                    const passwordMatch = await bcrypt.compare(password, user.password)

                    if (!passwordMatch) return null

                    return { id: user.id, email: user.email, usename: user.username, firstname: user.first_name, lastname: user.last_name }

                } catch (error: any) {
                    throw new Error(error)
                }
            }

        }),
        GitHubProvider({
            clientId: process.env.GITHUB_ID ?? "",
            clientSecret: process.env.GITHUB_SECRET ?? ""
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
        })
    ],
    session: { strategy: "jwt" },
    pages: {
        signIn: "/signin"
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (token?.id) {
                session.user.id = token.id as string
            }
            return session
        },
        async signIn({ account, profile }) {
            if (account?.provider === "google") {
                // 1. Cast profile to any or the specific Google type to avoid TS errors
                // 2. Use 'email_verified' instead of 'isVerified'
                const googleProfile = profile as GoogleProfile;

                return (
                    googleProfile.email_verified === true &&
                    googleProfile.email?.endsWith("@example.com")
                )
            }
            return true // Allow other providers (like Credentials)
        },
    },
}