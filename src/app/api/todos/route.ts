import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"



export async function POST(req: Request) {
    try {
        const { title, description, userId } = await req.json();

        const newTodo = await prisma.todos.create({
            data: {
                title,
                description,
                userId
            }
        })

        return NextResponse.json(
            { success: true, message: "Task Created successFully" ,todos:newTodo},
            { status: 200 }
        )

    } catch (error) {
        return NextResponse.json({ success: false, message: "Error creating Todo" })
    }
}


export async function GET(req: Request) {
    try {
        // We need to extract the userId from the URL  
        // (In a real application, it is taken from the session)
        // For now, assume that the userId is coming from query parameters
        // Example: /api/todos?userId=123

        const { searchParams } = new URL(req.url)
        const userId = searchParams.get("userId")

        if (!userId) {
            return NextResponse.json({ success: false, message: "User Id Required" })
        }

        const sevenDayAgo = new Date()
        sevenDayAgo.setDate(sevenDayAgo.getDate() - 7);

        await prisma.todos.deleteMany({
            where: {
                userId: userId,
                createdAt: {
                    lt: sevenDayAgo,
                }
            }
        })


        const myTodo = await prisma.todos.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json({ success: true, todos: myTodo })

    } catch (error) {

    }
}