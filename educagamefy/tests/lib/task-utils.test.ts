import { describe, it, expect } from 'vitest'
import { uniqueClassesFromTasks, filterTasksByClass } from '@/lib/task-utils'

describe('task-utils', () => {
  it('uniqueClassesFromTasks returns unique classes', () => {
    const tasks = [
      { id: 1, class: { id: 10, title: 'A' } },
      { id: 2, class: { id: 11, title: 'B' } },
      { id: 3, class: { id: 10, title: 'A' } },
      { id: 4, class: null },
    ]

    const result = uniqueClassesFromTasks(tasks)
    expect(result).toHaveLength(2)
    expect(result).toEqual(expect.arrayContaining([{ id: 10, title: 'A' }, { id: 11, title: 'B' }]))
  })

  it('filterTasksByClass filters correctly', () => {
    const tasks = [
      { id: 1, class: { id: 10 } },
      { id: 2, class: { id: 11 } },
      { id: 3, class: { id: 10 } },
    ]

    expect(filterTasksByClass(tasks, null)).toHaveLength(3)
    expect(filterTasksByClass(tasks, 10)).toHaveLength(2)
    expect(filterTasksByClass(tasks, 11)).toHaveLength(1)
  })
})
