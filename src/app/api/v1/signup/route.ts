import { SignUpSchema } from "@/schemas/auth";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt"
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {

        if (!request.headers.get("content-type")?.includes("application/json")) {
            return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 400 });
        }

        const body = await request.json();
        const bodyResult = SignUpSchema.safeParse(body);

        if (!bodyResult.success) {
            // Extracting error messages and sending a custom error array
            const errors = bodyResult.error.issues.map((issue) => ({ field: issue.path[0], message: issue.message }))

            return NextResponse.json({ error: errors }, { status: 400 })
        }

        const { username, email, password } = bodyResult.data;

        // Check if user exists or not
        const userExists = await prisma.user.findUnique({
            where: {
                email
            },
        });

        if (userExists) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 })
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create a new user in the db
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                email
            }
        })

        return NextResponse.json({
            "message": "User created successfully",
            "userId": user.id,
            "email": user.email
        }, { status: 201 })

    } catch (error) {
        if (error instanceof SyntaxError) {
            return NextResponse.json({ 'error': error.message }, { status: 400 })
        }
        return NextResponse.json({ 'error': error }, { status: 500 })
    }
}
