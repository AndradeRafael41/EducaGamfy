import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/services/prisma';
import { SupabaseService } from '@/services/supabase';
import { getToken } from 'next-auth/jwt';

const bucket = process.env.BUCKET_NAME!;
const supabaseService = new SupabaseService(bucket);
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function GET(req: NextRequest) {
  try {
    console.debug('[api/task-submissions] GET start', { url: req.url })
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ success: false, message: 'O parâmetro studentId é obrigatório.' }, { status: 400 });
    }

    // Authenticate
    const token = await getToken({ req, secret: NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ success: false, message: 'Não autenticado.' }, { status: 401 });

    // Authorization: can request own submissions or teachers
    if (String(token.id) !== String(studentId) && String(token.role)?.toLowerCase() !== 'teacher') {
      return NextResponse.json({ success: false, message: 'Não autorizado.' }, { status: 403 });
    }

    let submissions: any = []
    try {
      submissions = await prisma.task_submissions.findMany({
        where: { student_id: Number(studentId) },
      })
      console.debug('[api/task-submissions] GET found submissions count', { count: submissions.length, studentId })
      return NextResponse.json({ success: true, submissions });
    } catch (err: any) {
      console.debug('[api/task-submissions] findMany failed, attempting raw SQL fallback', { err: err?.message })
      const rows: any = await prisma.$queryRaw`
        SELECT * FROM task_submissions WHERE student_id = ${Number(studentId)}
      `
      submissions = Array.isArray(rows) ? rows : [rows]
      console.debug('[api/task-submissions] raw select submissions count', { count: submissions.length })
      return NextResponse.json({ success: true, submissions });
    }
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, error: err.message?.toString() ?? 'Erro interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.debug('[api/task-submissions] POST start', { url: req.url })
    const formData = await req.formData();
    const taskId = formData.get('taskId') as string | null;
    const studentId = formData.get('studentId') as string | null;
    const file = formData.get('file') as File | null;
    const link = formData.get('link') as string | null;

    console.debug('[api/task-submissions] form values', { taskId, studentId, hasFile: !!file, link })

    // Authenticate
    const token = await getToken({ req, secret: NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ success: false, message: 'Não autenticado.' }, { status: 401 });

    // Authorization: only the student themselves or teachers can submit
    if (String(token.id) !== String(studentId) && String(token.role)?.toLowerCase() !== 'teacher') {
      return NextResponse.json({ success: false, message: 'Não autorizado.' }, { status: 403 });
    }

    if (!taskId || !studentId) {
      return NextResponse.json({ success: false, message: 'taskId e studentId são obrigatórios.' }, { status: 400 });
    }

    let fileUrl: string | null = link ?? null;

    if (file) {
      try {
        console.debug('[api/task-submissions] file present, validating', { name: (file as any).name, size: (file as any).size, type: (file as any).type })
      } catch (e) {
        console.debug('[api/task-submissions] file metadata access error', e)
      }
      // validate size
      const size = (file as any).size ?? 0;
      const type = (file as any).type ?? '';
      if (size > MAX_UPLOAD_BYTES) {
        return NextResponse.json({ success: false, message: 'Arquivo maior que 10MB.' }, { status: 400 });
      }

      if (!type.startsWith('image/') && !ALLOWED_MIME.includes(type)) {
        return NextResponse.json({ success: false, message: 'Tipo de arquivo não permitido.' }, { status: 400 });
      }

      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name}`;
      const filePath = `submissions/${taskId}/${studentId}/${fileName}`;

      console.debug('[api/task-submissions] uploading to supabase', { filePath })

      const uploadResult: any = await supabaseService.uploadFile(filePath, file);
      const storedPath = uploadResult?.path ?? filePath
      console.debug('[api/task-submissions] upload result', { storedPath, uploadResult: !!uploadResult })
      fileUrl = await supabaseService.getPublicUrl(storedPath);
      console.debug('[api/task-submissions] uploaded, public url', { fileUrl })
    }

    // Se já houver submissão, proibir reenvio quando já estiver com status 'submitted'
    let existing: any = null
    try {
      existing = await prisma.task_submissions.findFirst({
        where: { task_id: Number(taskId), student_id: Number(studentId) },
      })
    } catch (err: any) {
      console.debug('[api/task-submissions] findFirst failed, attempting raw SQL fallback', { err: err?.message })
      try {
        const rows: any = await prisma.$queryRaw`
          SELECT * FROM task_submissions WHERE task_id = ${Number(taskId)} AND student_id = ${Number(studentId)} LIMIT 1
        `
        existing = Array.isArray(rows) ? rows[0] : rows
        console.debug('[api/task-submissions] raw select result', { existing: !!existing })
      } catch (err2) {
        console.error('[api/task-submissions] raw select failed', err2)
        throw err2
      }
    }

    let submission;

    if (existing) {
      const existingStatus = String(existing.status || '').toLowerCase();
      if (existingStatus === 'submitted' || existingStatus === 'submetido' || existingStatus === 'enviado') {
        return NextResponse.json({ success: false, message: 'Submissão já realizada. Reenvio não permitido.' }, { status: 400 });
      }

      // determine case style for enum values based on existing status casing
      const submittedValue = existing.status === (existing.status || '').toUpperCase() ? 'SUBMITTED' : 'submitted';
      try {
        submission = await prisma.task_submissions.update({
          where: { id: existing.id },
          data: {
            link: fileUrl,
            status: submittedValue,
            submitted_at: new Date(),
          },
        });
      } catch (err) {
        console.debug('[api/task-submissions] update failed, attempting raw SQL fallback', { err: (err as any)?.message });
        // fallback to raw SQL update to avoid enum/client mismatch; use db enum 'respondida'
        const rows: any = await prisma.$queryRaw`
          UPDATE task_submissions
          SET link = ${fileUrl}, status = ${'respondida'}::task_status, submitted_at = now()
          WHERE id = ${existing.id}
          RETURNING *
        `;
        submission = Array.isArray(rows) ? rows[0] : rows;
      }
    } else {
      // Try to create with common enum casing. If it fails due to invalid enum value, retry with alternate casing.
      const tryCreate = async (statusValue: string) => {
        return await prisma.task_submissions.create({
          data: {
            task_id: Number(taskId),
            student_id: Number(studentId),
            points: 0,
            status: statusValue as any,
            submitted_at: new Date(),
            link: fileUrl,
          },
        });
      };

      // Use DB enum value 'respondida' for submitted state (schema uses Portuguese enum)
      const dbSubmitted = 'respondida'
      try {
        submission = await tryCreate(dbSubmitted)
      } catch (err) {
        console.debug('[api/task-submissions] create with dbSubmitted failed, attempting raw SQL insert', { err: (err as any)?.message })
        // fallback to raw SQL insert with explicit cast to task_status
        const rows: any = await prisma.$queryRaw`
          INSERT INTO task_submissions (task_id, student_id, points, status, submitted_at, link)
          VALUES (${Number(taskId)}, ${Number(studentId)}, 0, ${dbSubmitted}::task_status, now(), ${fileUrl})
          RETURNING *
        `;
        submission = Array.isArray(rows) ? rows[0] : rows;
      }
    }

    return NextResponse.json({ success: true, submission });
  } catch (err: any) {
    console.error('[api/task-submissions] POST error', err);
    return NextResponse.json({ success: false, error: err.message?.toString() ?? 'Erro interno' }, { status: 500 });
  }
}
