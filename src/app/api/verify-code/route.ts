import { NextResponse } from "next/server";
import { usernameValidation } from "@/schemas/usernameValidation";
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const verifyCodeSchema = z.object({
    username: usernameValidation,
    code: z.string().length(6, "code must be 6 digits")
})

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const res = verifyCodeSchema.safeParse(body)
        if (!res.success) {
            return NextResponse.json({
                success: false,
                message: "Invalid code format"
            }, { status: 400 })
        }

        const { username, code } = res.data

        const decodingUsername = decodeURIComponent(username)
        const user = await prisma.user.findUnique({
            where: { username: decodingUsername }
        })

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 400 }
            )
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpiry = new Date(user.verifyCodeExpiry) > new Date()

        if (isCodeValid && isCodeNotExpiry) {
            await prisma.user.update({
                where: { username: decodingUsername },
                data: {
                    isVerified: true
                }
            })

            return NextResponse.json(
                { success: true, message: "Account verified successfully" },
                { status: 200 }
            )
        }
        else if (!isCodeNotExpiry) {
            return NextResponse.json(
                { success: false, message: "Verification code expire" },
                { status: 400 }
            )
        } else {
            return NextResponse.json(
                { success: false, message: "Incorrect Verification code" },
                { status: 400 }
            )
        }
    } catch (error) {
        console.error("Error verifying user:", error);
        return NextResponse.json(
            { success: false, message: "Error verifying user" },
            { status: 500 }
        );
    }
}