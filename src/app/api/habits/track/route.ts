import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const { habitId,note } = await req.json()
        console.log("Receiving Habit ID:", habitId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingLog = await prisma.habitLog.findFirst({
            where: {
                habitId: habitId,
                date: today
            }
        })

        if (existingLog) {
            // Delete Logic
            await prisma.habitLog.delete({
                where: {
                    id: existingLog.id
                }
            })
        } else {
            const newLog = await prisma.habitLog.create({
                data: {
                    // habitId: habitId,
                    date: today,
                    status: "COMPLETED",
                    note:note,
                    habit:{
                        connect:{id:habitId}
                    },
                }
            })
            return Response.json({ message: "Already completed for today", habidlog: newLog })
        }
    } catch (error) {
        return NextResponse.json({ success: false, message: "Error geting habitlog" })
    }
}