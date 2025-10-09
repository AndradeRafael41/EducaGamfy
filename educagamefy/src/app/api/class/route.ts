import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prisma";

export async function GET(req: NextRequest) {


    try {

        const { searchParams } = new URL(req.url);
        const classId = searchParams.get("classId");

        if (!classId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "forneça o id da sala"
                },
                {
                    status:400
                }
            );
        }


        const findClass = await prisma.classes.findUnique({where : {id : Number(classId)}});

        if (!findClass){
            return NextResponse.json(
                {
                    success : true,
                    message : "nenhum resultado encontrando"
                },
                {
                    status : 404
                }
            );
        }

        return NextResponse.json(
            {
                success : true,
                findClass
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
        );
    }
}