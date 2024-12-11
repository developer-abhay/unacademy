import { SignInSchema } from "@/schemas/auth";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {

        if (!request.headers.get("content-type")?.includes("application/json")) {
            return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 400 });
        }

        const body = await request.json();
        const bodyResult = SignInSchema.safeParse(body);

        if (!bodyResult.success) {
            // Extracting error messages and sending a custom error array
            const errors = bodyResult.error.issues.map((issue) => ({ field: issue.path[0], message: issue.message }))

            return NextResponse.json({ error: errors }, { status: 400 })
        }

        const { email, password } = bodyResult.data;

        // Check if user exists or not
        const userExists = await prisma.user.findUnique({
            where: {
                email
            },
        });

        if (!userExists) return NextResponse.json({ error: 'Invalid Credentials' }, { status: 401 });

        // Match the password
        const passwordMatches = await bcrypt.compare(password, userExists.password);

        if (!passwordMatches) return NextResponse.json({ error: 'Invalid Credentials' }, { status: 401 });

        // Create a token
        if (!process.env.NEXT_PUBLIC_JWT_SECRET) {
            throw new Error('Something went wrong')
        }
        const token = jwt.sign({ id: userExists.id }, process.env.NEXT_PUBLIC_JWT_SECRET)

        return NextResponse.json({
            "token": token,
            "userId": userExists.id
        }, { status: 200 })

    } catch (error) {
        if (error instanceof SyntaxError) {
            return NextResponse.json({ 'error': error.message }, { status: 400 })
        }
        return NextResponse.json({ 'error': error }, { status: 500 })
    }
}
