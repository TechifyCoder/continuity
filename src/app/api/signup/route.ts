import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { usernameValidation } from "@/schemas/usernameValidation"

const signupSchema = z.object({
    username: usernameValidation,
    first_name: z.string(),
    last_name: z.string(),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password min 6 chars"),
})

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = signupSchema.safeParse(body);
        if (!parsed.success) {
            console.error("Zod Error:", JSON.stringify(parsed.error.format(), null, 2));
            return NextResponse.json({ 
                success: false, 
                message: "Validation Error", 
                errors: parsed.error.format() 
            }, { status: 400 });
        }
        const { username, first_name, last_name, email, password } = parsed.data

        const existingUser = await prisma.user.findFirst(
            {
                where: {
                    OR: [
                        { username: username },
                        { email: email }
                    ]
                }
            }
        )

        if (existingUser) {
            return NextResponse.json({
                status: false,
                message: "email is already exist"
            }, { status: 409 })
        }

        const hashPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                username,
                first_name,
                last_name,
                email,
                password: hashPassword
            }
        })

        return NextResponse.json({ message: "User created", userId: user.id }, { status: 201 })
    } catch (error: any) {
        console.error(error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}