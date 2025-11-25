import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// We'll import the handler module (it exports PUT). We'll mock next-auth/jwt and prisma service.
import * as route from '../../src/app/api/teacher/tasks/route'

vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}))

vi.mock('../../src/services/prisma', () => ({
  prisma: {
    $queryRaw: vi.fn(),
    $executeRaw: vi.fn(),
  },
}))

import { getToken } from 'next-auth/jwt'
import { prisma } from '../../src/services/prisma'

describe('PUT /api/teacher/tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 404 when submission not found', async () => {
    ;(getToken as any).mockResolvedValue({ sub: '1' })
    ;(prisma.$queryRaw as any).mockResolvedValue([])

    const req = { json: async () => ({ submissionId: 999, points: 5 }) }

    const res = await route.PUT(req as any)

    const body = await res.json()
    expect(res.status).toBe(404)
    expect(body.error).toBe('Submission not found')
  })

  it('returns 403 when teacher does not own the task', async () => {
    ;(getToken as any).mockResolvedValue({ sub: '2' })
    // submission row with teacher_id 1
    ;(prisma.$queryRaw as any).mockResolvedValueOnce([{ id: 1, teacher_id: 1, max_points: 10 }])

    const req = { json: async () => ({ submissionId: 1, points: 5 }) }

    const res = await route.PUT(req as any)
    const body = await res.json()
    expect(res.status).toBe(403)
    expect(body.error).toBe('Forbidden')
  })

  it('updates points and returns populated submission', async () => {
    ;(getToken as any).mockResolvedValue({ sub: '1' })
    // first $queryRaw for finding submission
    ;(prisma.$queryRaw as any)
      .mockResolvedValueOnce([{ id: 2, teacher_id: 1, max_points: 10 }])
      // second $queryRaw returning updated submission JSON
      .mockResolvedValueOnce([
        {
          submission: {
            id: 2,
            task_id: 5,
            student_id: 7,
            points: 8,
            submitted_at: '2025-11-24T00:00:00.000Z',
            link: 'https://cdn.example/submission.pdf',
            status: 'respondida',
            student: { id: 7, user: { id: 7, name: 'Aluno', email: 'a@b' } },
            task: { id: 5, title: 'Tarefa', max_points: 10 },
          },
        },
      ])

    ;(prisma.$executeRaw as any).mockResolvedValue(1)

    const req = { json: async () => ({ submissionId: 2, points: 8 }) }

    const res = await route.PUT(req as any)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.submission).toBeDefined()
    expect(body.submission.points).toBe(8)
    expect(body.submission.student.user.name).toBe('Aluno')
  })
})
