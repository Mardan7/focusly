import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Field, TextArea, TextInput } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { useTaskStore } from '@/store/useTaskStore'
import { useUIStore } from '@/store/useUIStore'
import { TASK_CATEGORIES, TASK_PRIORITIES, type TaskCategory, type TaskPriority } from '@/types/task'
import { useI18n } from '@/i18n'

const blank = { title: '', description: '', category: 'Coding' as TaskCategory, priority: 'Medium' as TaskPriority, estimatedPomodoros: 1, dueDate: '' }

export function TaskModal() {
  const open = useUIStore((state) => state.taskModalOpen)
  const editingId = useUIStore((state) => state.editingTaskId)
  const close = useUIStore((state) => state.closeTaskModal)
  const tasks = useTaskStore((state) => state.tasks)
  const addTask = useTaskStore((state) => state.addTask)
  const updateTask = useTaskStore((state) => state.updateTask)
  const task = tasks.find((item) => item.id === editingId)
  const { t } = useI18n()
  const [form, setForm] = useState(blank)

  useEffect(() => {
    setForm(task ? { title: task.title, description: task.description, category: task.category, priority: task.priority, estimatedPomodoros: task.estimatedPomodoros, dueDate: task.dueDate?.slice(0, 10) ?? '' } : blank)
  }, [task, open])

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.title.trim()) return
    const payload = { ...form, dueDate: form.dueDate ? new Date(`${form.dueDate}T12:00:00`).toISOString() : null }
    if (editingId) updateTask(editingId, payload)
    else addTask(payload)
    close()
  }

  return (
    <Modal open={open} onClose={close} title={editingId ? t('modal.editTask') : t('modal.newTask')} description={t('modal.description')}>
      <form className="space-y-4" onSubmit={submit}>
        <Field label={t('modal.title')}><TextInput autoFocus required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder={t('modal.titlePlaceholder')} /></Field>
        <Field label={t('modal.taskDescription')}><TextArea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder={t('modal.descriptionPlaceholder')} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('modal.category')}><Select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as TaskCategory })}>{TASK_CATEGORIES.map((item) => <option key={item} value={item}>{t(`category.${item}`)}</option>)}</Select></Field>
          <Field label={t('modal.priority')}><Select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as TaskPriority })}>{TASK_PRIORITIES.map((item) => <option key={item} value={item}>{t(`priority.${item}`)}</option>)}</Select></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('modal.pomodoros')}><TextInput type="number" min={1} max={20} value={form.estimatedPomodoros} onChange={(event) => setForm({ ...form, estimatedPomodoros: Number(event.target.value) })} /></Field>
          <Field label={t('modal.dueDate')}><TextInput type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} /></Field>
        </div>
        <div className="flex justify-end gap-2 pt-2"><Button variant="ghost" onClick={close}>{t('modal.cancel')}</Button><Button variant="accent" type="submit">{editingId ? t('modal.save') : t('modal.create')}</Button></div>
      </form>
    </Modal>
  )
}