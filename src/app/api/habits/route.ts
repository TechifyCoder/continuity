import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const { title, description, userId } = await req.json()
        if (!title) {
            return Response.json({ success: false, message: "Title is compulsalry" })
        }
        const newHabit = await prisma.habit.create({
            data: {
                title,
                description,
                userId
            }
        })

        return Response.json({ success: true, message: "Habit created succesfully", habits: newHabit })
    } catch (error) {
        return NextResponse.json({ success: false, message: "Error creating habit" })
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ success: false, message: "User Id Required" })
        }

        const myHabit = await prisma.habit.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        })


        return Response.json({success:true,message:"Geting todo sucessfully",habits:myHabit})
    } catch (error) {
        return NextResponse.json({ success: false, message: "Error geting habit" })
    }
}