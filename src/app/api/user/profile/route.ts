import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function GET(req: Request) {
    try {
        const body = await req.json();
        const { userId, first_name, last_name, oldPassword, newPassword } = body;

        const updateUserData: any = {
            first_name,
            last_name
        };

        // 2. Password Change Logic (Optional but impressive)

        if (oldPassword && newPassword) {
            // Get the user from the database
            const user = await prisma.user.findUnique({ where: { id: userId } })
            // Verify old password (Import logic from login)
            // const isValid = await compare(oldPassword, user.password);
            // if (!isValid) throw new Error("Wrong old password");

            //Hash the new password and save it.

            updateUserData.password = await hash(newPassword, 10)

        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateUserData,
            select: { id: true, username: true, first_name: true }
        });

        return NextResponse.json({ success: true, user: updatedUser });

    } catch (error) {
        console.log("Update failed");
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}