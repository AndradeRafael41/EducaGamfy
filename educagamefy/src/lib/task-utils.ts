export function uniqueClassesFromTasks(tasks: any[]) {
  const map = new Map<number, any>()
  tasks.forEach((t) => {
    if (t.class && t.class.id != null) {
      map.set(t.class.id, t.class)
    }
  })
  return Array.from(map.values())
}

export function filterTasksByClass(tasks: any[], classId: number | null) {
  if (!classId) return tasks
  return tasks.filter((t) => t.class?.id === classId)
}
