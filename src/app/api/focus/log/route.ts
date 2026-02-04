import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { error } from "console";
import { success } from "zod";

export async function POST(req: Request) {
    try {
        const { userId, durationMinutes, goalMinutes } = await req.json()
        let earnedXp = durationMinutes * 5;

        if (!userId || !durationMinutes) {
            return NextResponse.json({ message: "Invalid Data" }, { status: 400 });
        }

        // XP Calculation Logic
        if (durationMinutes >= goalMinutes) {
            earnedXp += 50
        }

        // Transaction: Save the user and increase the user's total spending.
        // A transaction ensures that both actions are completed, or neither is.

        const result = await prisma.$transaction(async (tx) => {

            // user current data
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: { xp: true, level: true }
            })

            if (!user) throw new Error("User not Found");

            // Calculate New Totals
            const newTotalXp = user.xp + earnedXp;

            // Level Formula: Math.floor(TotalXP / 1000) + 1
            // 950 XP / 1000 = 0.95 -> floor(0) -> +1 = Level 1
            // 1050 XP / 1000 = 1.05 -> floor(1) -> +1 = Level 2
            const newLevel = Math.floor(newTotalXp / 1000) + 1;

            // Step C: Update User (XP + Level)
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: {
                    xp: newTotalXp,
                    level: newLevel
                }
            });

            // create log
            const log = await tx.focusLog.create({
                data: {
                    userId,
                    duration: durationMinutes,
                    goalDuration: goalMinutes,
                    xpEarned: earnedXp
                }
            });

            return {
                log,
                newXP: updatedUser.xp,
                newLevel: updatedUser.level,
                leveledUp: newLevel > user.level // Tell the frontend whether the level has been updated or not.
            };
        })

        return NextResponse.json({ success: true, data: result })
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: "Failed to log focus" }, { status: 500 });
    }
}