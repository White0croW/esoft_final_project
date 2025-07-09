import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const signInSchema = z.object({
    email: z.string().email({ message: "Invalid email" }),
    password: z.string().min(6, { message: "Min 6 characters" }),
});

export const signUpSchema = z
    .object({
        name: z.string().min(1, { message: "Required" }),
        email: z.string().email({ message: "Invalid email" }),
        password: z.string().min(6, { message: "Min 6 characters" }),
        confirm: z.string().min(6),
    })
    .refine((data) => data.password === data.confirm, {
        message: "Passwords must match",
        path: ["confirm"],
    });
