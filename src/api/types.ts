export interface ApiUser {
  id: number
  name: string
  email: string
  created_at: string
}

export interface ApiTask {
  id: string
  user_id: number
  title: string
  description: string
  priority: 'Low' | 'Medium' | 'High'
  category: 'Study' | 'Work' | 'Personal' | 'Coding' | 'Other'
  completed: boolean
  estimated_pomodoros: number
  completed_pomodoros: number
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface ApiSession {
  id: number
  user_id: number
  task_id: string | null
  session_type: 'focus' | 'shortBreak' | 'longBreak'
  duration: number
  started_at: string | null
  completed_at: string | null
  completed: boolean
}

export interface ApiSettings {
  id: number
  user_id: number
  language: 'en' | 'ru' | 'kk'
  theme: 'dark' | 'light' | 'system'
  sound_enabled: boolean
  auto_focus_mode: boolean
  show_dnd_reminder: boolean
  auto_fullscreen: boolean
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: ApiUser
}
