import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prisma";

export async function GET(req: NextRequest) {

    try {

        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get("teacherId");


        if (!teacherId) {
            return NextResponse.json(
                {
                    sucess: false,
                    message: "fornceça o id do professor"
                },
                {
                    status: 400
                }
            )
        }


        const classes = await prisma.classes.findMany({
            where: {
                teacher_id: Number(teacherId)
            },
        });


        if (classes.length === 0) {
            return NextResponse.json(
                {
                    success: true,
                    message: "nenhum registro encontrado"
                },
                {
                    status: 404
                }
            )
        }

        return NextResponse.json(
            {
                success: true,
                classes
            },
            {
                status : 200
            }
        )


    } catch (err: any) {
        console.error(err);

        return NextResponse.json(
            {
                success: false,
                error: err.message.toString()

            },
            {
                status: 500
            }
        )
    }


}