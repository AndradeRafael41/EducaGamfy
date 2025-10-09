import { NextResponse } from 'next/server';
import { prisma } from '@/services/prisma'; 

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json(
        { success: false, message: 'O parâmetro classId é obrigatório.' },
        { status: 400 }
      );
    }

    const tasks = await prisma.tasks.findMany({
      where: {
        class_id: Number(classId), 
      },
    });

    return NextResponse.json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: 'Erro ao buscar tarefas.' },
      { status: 500 }
    );
  }
}
