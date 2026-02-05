import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { success } from "zod";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const currentUserId = searchParams.get('userId')

        if (!currentUserId) {
            return NextResponse.json({ message: "UserId not found" }, { status: 400 });
        }

        const topUsers = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                xp: true,
                level: true,
                persona: true,
            },
            orderBy: [
                { xp: 'desc' }, // more xp in top
                {updatedAt:'asc'}   
            ],
            take: 10
        });

        // find the current user rank
        let myData = null;
        let myRank = null;

        if (currentUserId) {
            // User data
            myData = await prisma.user.findUnique({
                where: { id: currentUserId },
                select: { xp: true, username: true }
            });

            if (myData) {
                // Rank Calculation Logic:
                // "How many people have more XP than me?" + 1 = My Rank
                // Example: If 5 people have more XP than me, then my rank is 6th.

                const userAhead = await prisma.user.count({
                    where: {
                        xp: {
                            gt: myData.xp
                        }
                    }
                });
                myRank = userAhead + 1;
            }
        }
        return NextResponse.json({
            success: true,
            lederboard: topUsers,
            userRank: {
                rank: myRank,
                xp: myData?.xp,
                username: myData?.username
            }
        })
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to fetch leaderboard" }, { status: 500 });
    }
}