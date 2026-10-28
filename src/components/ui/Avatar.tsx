import { useAuthStore } from '@/store/useAuthStore'
import { cn } from '@/utils/cn'

export function Avatar({ className }: { className?: string }) {
  const user = useAuthStore((state) => state.user)
  return <span className={cn('inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-soft font-semibold text-accent', className)}>
    {user?.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : (user?.name ?? 'F').slice(0, 2).toUpperCase()}
  </span>
}
