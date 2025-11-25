import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/services/prisma"

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!token || !token.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teacherId = parseInt(token.sub)

    console.log(`[api/teacher/tasks] GET - teacherId: ${teacherId}`)

    // Buscar tarefas criadas pelo professor com suas submissões usando raw SQL
    // para evitar problemas com enum mapping do Prisma
    const tasks = await prisma.$queryRaw`
      SELECT 
        t.id,
        t.teacher_id,
        t.title,
        t.description,
        t.max_points,
        t.created_at,
        t.due_date,
        t.link,
        t.class_id,
        json_build_object(
          'id', c.id,
          'title', c.title
        ) as "class",
        COALESCE(json_agg(
          json_build_object(
            'id', ts.id,
            'task_id', ts.task_id,
            'student_id', ts.student_id,
            'points', ts.points,
            'submitted_at', ts.submitted_at,
            'link', ts.link,
            'status', ts.status,
            'student', json_build_object(
              'id', s.id,
              'user', json_build_object(
                'id', u.id,
                'name', u.name,
                'email', u.email
              )
            )
          )
        ) FILTER (WHERE ts.id IS NOT NULL), '[]'::json) as submissions
      FROM tasks t
      LEFT JOIN classes c ON t.class_id = c.id
      LEFT JOIN task_submissions ts ON t.id = ts.task_id
      LEFT JOIN students s ON ts.student_id = s.id
      LEFT JOIN users u ON s.id = u.id
      WHERE t.teacher_id = ${teacherId}
      GROUP BY t.id, c.id, c.title
      ORDER BY t.created_at DESC
    `

    console.log(`[api/teacher/tasks] Found ${(tasks as any[]).length} tasks`)

    return NextResponse.json({ success: true, tasks })
  } catch (err: any) {
    console.error("[api/teacher/tasks] Error:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!token || !token.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teacherId = parseInt(token.sub)
    const { submissionId, points } = await req.json()

    console.log(`[api/teacher/tasks] PUT - teacherId: ${teacherId}, submissionId: ${submissionId}, points: ${points}`)
    // Buscar submissão + task via raw SQL para evitar problemas com enum mapping
    const submissionRows: any = await prisma.$queryRaw`
      SELECT ts.id, ts.task_id, ts.student_id, ts.points, ts.submitted_at, ts.link, ts.status,
             t.id as task_id, t.teacher_id, t.max_points
      FROM task_submissions ts
      JOIN tasks t ON ts.task_id = t.id
      WHERE ts.id = ${submissionId}
    `

    const submissionRow = submissionRows?.[0]
    if (!submissionRow) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    if (submissionRow.teacher_id !== teacherId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const cappedPoints = Math.min(points, submissionRow.max_points)

    // Atualizar pontos usando raw SQL (evita mapeamento de enums no select)
    await prisma.$executeRaw`
      UPDATE task_submissions
      SET points = ${cappedPoints}
      WHERE id = ${submissionId}
    `

    // Buscar submissão atualizada com student.user e task info como JSON
    const updatedRows: any = await prisma.$queryRaw`
      SELECT json_build_object(
        'id', ts.id,
        'task_id', ts.task_id,
        'student_id', ts.student_id,
        'points', ts.points,
        'submitted_at', ts.submitted_at,
        'link', ts.link,
        'status', ts.status,
        'student', json_build_object(
          'id', s.id,
          'user', json_build_object(
            'id', u.id,
            'name', u.name,
            'email', u.email
          )
        ),
        'task', json_build_object(
          'id', t.id,
          'title', t.title,
          'max_points', t.max_points
        )
      ) as submission
      FROM task_submissions ts
      JOIN tasks t ON ts.task_id = t.id
      LEFT JOIN students s ON ts.student_id = s.id
      LEFT JOIN users u ON s.id = u.id
      WHERE ts.id = ${submissionId}
      LIMIT 1
    `

    const updatedSubmission = updatedRows?.[0]?.submission ?? null

    console.log(`[api/teacher/tasks] Updated submission ${submissionId} to points: ${cappedPoints}`)

    return NextResponse.json({ success: true, submission: updatedSubmission })
  } catch (err: any) {
    console.error("[api/teacher/tasks] Error:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
