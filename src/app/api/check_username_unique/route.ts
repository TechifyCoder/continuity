import z from 'zod'
import { usernameValidation } from '@/schemas/usernameValidation'
import { prisma } from '@/lib/prisma'

const usernameValid = z.object({
    username: usernameValidation
})
console.log(typeof prisma)          // "object" aana chahiye (PrismaClient)
console.log('data' in prisma)       // false aana chahiye
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const queryParams = {
            username: searchParams.get('username')
        }


        const result = usernameValid.safeParse(queryParams)

        if (!result.success) {
            const usernameError = result.error.format().username?._errors || []
            return Response.json({
                success: false,
                message: usernameError?.length > 0
                    ? usernameError.join(', ')
                    : 'Invalid query parameters',
            }, { status: 400 })

        }
        const username  = result.data
        const existingUsername = await prisma.user.findUnique({
            where: { username : prisma.data.username },
            select: { id: true }
        })

        if (existingUsername) {
            return Response.json({
                success: false,
                message: "Username is alrady taken"
            }, { status: 200 })
        }

        return Response.json({
            success: true,
            message: "Username is Unique"
        }, { status: 200 })

    } catch (error) {
        console.log("Error checking Username", error)
        return Response.json({
            success: false,
            message: "Error checking Username"
        }, { status: 500 })
    }
}