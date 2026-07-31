export function getSubjectPriority(subjectNameOrId?: string): number {
  if (!subjectNameOrId) return 50;
  const s = subjectNameOrId.trim().toLowerCase();

  // 1. Math (Toán)
  if (s === "toan" || s.startsWith("toán") || s.includes("toán") || s.includes("math")) {
    return 1;
  }

  // 2. Physics (Lý / Vật lý)
  if (
    s === "ly" ||
    s === "lý" ||
    s.includes("vật lý") ||
    s.includes("vật lí") ||
    s.includes("physics")
  ) {
    return 2;
  }

  // 3. Chemistry (Hóa / Hóa học)
  if (
    s === "hoa" ||
    s === "hóa" ||
    s.includes("hóa học") ||
    s.includes("hóa") ||
    s.includes("chem")
  ) {
    return 3;
  }

  // 5. English / Foreign Language -> ALWAYS LAST
  if (
    s === "tieng-anh" ||
    s.includes("tiếng anh") ||
    s.includes("ngoại ngữ") ||
    s === "anh" ||
    s.includes("english")
  ) {
    return 99;
  }

  // 4. Other added custom subjects
  return 10;
}

export function sortSubjects<T extends { id: string; name?: string }>(subjects: T[]): T[] {
  const list = [...subjects];
  list.sort((a, b) => {
    const prioA = getSubjectPriority(a.id || a.name);
    const prioB = getSubjectPriority(b.id || b.name);
    if (prioA !== prioB) return prioA - prioB;
    // Maintain relative stability for added custom subjects
    return 0;
  });
  return list;
}

export function sortLessonsBySubjectPriority<T extends { sourceSubject?: string; id?: string }>(
  lessons: T[],
): T[] {
  const list = [...lessons];
  list.sort((a, b) => {
    const prioA = getSubjectPriority(a.sourceSubject || a.id);
    const prioB = getSubjectPriority(b.sourceSubject || b.id);
    if (prioA !== prioB) return prioA - prioB;
    return 0; // Preserve relative sequential lesson order within the same subject
  });
  return list;
}
