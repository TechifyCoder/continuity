import z from "zod";


export const usernameValidation = z
        .string()
        .min(4,"Username must be at least 4 chracter")
        .max(15,"Username must be at most 15 chracter")
        .regex(/^[a-zA-Z0-9_]+$/, "Username not contain special chracter")