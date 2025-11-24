import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/services/prisma';
import { getToken } from 'next-auth/jwt';

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'O parâmetro userId é obrigatório.' }, { status: 400 });
    }

    // Authenticate
    const token = await getToken({ req, secret: NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ success: false, message: 'Não autenticado.' }, { status: 401 });

    // Authorization: student can request own data, teacher can request any
    if (String(token.id) !== String(userId) && String(token.role)?.toLowerCase() !== 'teacher') {
      return NextResponse.json({ success: false, message: 'Não autorizado.' }, { status: 403 });
    }

    const student = await prisma.students.findUnique({
      where: { id: Number(userId) },
      include: { class: true, user: true },
    });

    if (!student) {
      return NextResponse.json({ success: false, message: 'Aluno não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, student });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, error: err.message?.toString() ?? 'Erro interno' }, { status: 500 });
  }
}
