import z, { success } from 'zod'
import { usernameValidation } from '@/schemas/usernameValidation'
import { prisma } from '@/lib/prisma'

const usernameValid = z.object({
    username: usernameValidation
})

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
        const { username } = result.data
        const existingUsername = await prisma.user.update({
            where: { username },
            data: { isVerified: true }
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