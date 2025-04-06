export interface TimeEntry {
  id: string;
  description: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  project_id?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface TimerState {
  id?: string;
  description: string;
  startTime?: string;
  projectId?: string;
  tags: string[];
  isRunning: boolean;
}

export interface TimerUpdate {
  description?: string;
  projectId?: string;
  tags?: string[];
}

export interface TimerContextType {
  currentTimer: TimerState;
  recentEntries: TimeEntry[];
  isLoading: boolean;
  error: string | null;
  startTimer: (projectId: string | null, description: string, tags: string[]) => Promise<void>;
  stopTimer: () => Promise<void>;
  updateTimer: (update: TimerUpdate) => Promise<void>;
  getTimeEntries: (skip?: number, limit?: number) => Promise<TimeEntry[]>;
  refreshEntries: () => Promise<void>;
}
