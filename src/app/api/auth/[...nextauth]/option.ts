import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
// import { PrismaAdapter } from '@prisma/adapter-pg'

export const authOptions: NextAuthOptions = {
    
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
                    const user = await prisma.user.updateMany({
                        data: [
                            { email: credentials.identifier },
                            { username: credentials.identifier }
                        ]
                    })

                    if (!user) {
                        throw new Error("No User found with email")
                    }

                    if (!prisma.user.findFirst({ where: { isVerified: true } })) {
                        throw new Error("You are verify first")
                    }

                    // const isPasswordCorrect = await bcrypt.compare(
                    //     credentials.password,
                    //     prisma.user.findFirst({where:{password}})
                    // )

                    // if(isPasswordCorrect){
                    //     return user;
                    // }else{
                    //     throw new Error("Incorrect password")
                    // }
                } catch (error: any) {
                    throw new Error(error)
                }
            }
        })
    ]
}