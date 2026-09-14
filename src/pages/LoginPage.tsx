import { Eye, EyeOff } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiErrorMessage, backupAnonymousData, hydrateRemoteData } from '@/api'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field, TextInput } from '@/components/ui/Input'
import { Logo } from '@/components/layout/Logo'
import { useI18n } from '@/i18n'
import { useAuthStore } from '@/store/useAuthStore'

export function LoginPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const loading = useAuthStore((state) => state.loading)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    try {
      backupAnonymousData()
      const user = await login(email, password)
      const token = useAuthStore.getState().token
      if (token) await hydrateRemoteData(token)
      navigate('/', { replace: true, state: { user } })
    } catch (requestError) {
      setError(apiErrorMessage(requestError, t('auth.error')))
    }
  }

  return <main className="flex min-h-screen items-center justify-center bg-bg px-4 py-10 text-text"><div className="w-full max-w-md"><div className="mb-8 flex justify-center"><Logo /></div><Card hover={false}><p className="text-sm text-accent">FOCUSLY</p><h1 className="mt-2 text-3xl font-semibold">{t('auth.welcome')}</h1><form className="mt-7 space-y-4" onSubmit={submit}><Field label={t('auth.email')}><TextInput required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></Field><Field label={t('auth.password')}><div className="relative"><TextInput required type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="pr-11" /><button type="button" aria-label={showPassword ? t('auth.password') : t('auth.password')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted hover:text-text" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></Field>{error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}<Button type="submit" variant="accent" className="w-full" disabled={loading}>{loading ? t('auth.loading') : t('auth.login')}</Button></form><p className="mt-6 text-center text-sm text-muted">{t('auth.noAccount')} <Link to="/register" className="text-accent hover:underline">{t('auth.signUp')}</Link></p></Card></div></main>
}
