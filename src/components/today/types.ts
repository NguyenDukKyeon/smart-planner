export type TimerLessonRequest = {
  id: string;
  title: string;
  xp: number;
  isCompleted: boolean;
  initialMinutes?: number;
  targetMinutes?: number;
  reviewTaskId?: string;
  reviewTargetMinutes?: number;
};

export type ManualStudyRequest = {
  lessonId: string;
  lessonTitle: string;
  estimatedMinutes: number;
  reviewTaskId?: string;
};
