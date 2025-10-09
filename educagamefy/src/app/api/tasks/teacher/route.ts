import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prisma";

export async function GET(req: NextRequest) {

    try {

        const { searchParams } = new URL(req.url);
        const classId = searchParams.get('classId');
        const teacherId = searchParams.get('teatcherId');

        if (!classId) {
            return NextResponse.json(
                { success: false, message: 'O parâmetro classId é obrigatório.' },
                { status: 400 }
            );
        }

        if (!teacherId) {
            return NextResponse.json(
                { success: false, message: 'O parâmetro teacherId é obrigatório.' },
                { status: 400 }
            );
        }

        const tasks = await prisma.tasks.findMany({
            where: {
                class_id: Number(classId),
                teacher_id: Number(teacherId)
            },
        });

        return NextResponse.json({
            success: true,
            tasks,
        });

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