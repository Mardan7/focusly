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

export function RegisterPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const register = useAuthStore((state) => state.register)
  const loading = useAuthStore((state) => state.loading)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim()) return setError(t('auth.nameRequired'))
    if (password.length < 8) return setError(t('auth.passwordLength'))
    if (password !== confirmPassword) return setError(t('auth.passwordMismatch'))
    setError('')
    try {
      backupAnonymousData()
      await register(name, email, password)
      const token = useAuthStore.getState().token
      if (token) await hydrateRemoteData(token)
      navigate('/', { replace: true })
    } catch (requestError) {
      setError(apiErrorMessage(requestError, t('auth.error')))
    }
  }

  return <main className="flex min-h-screen items-center justify-center bg-bg px-4 py-10 text-text"><div className="w-full max-w-md"><div className="mb-8 flex justify-center"><Logo /></div><Card hover={false}><p className="text-sm text-accent">FOCUSLY</p><h1 className="mt-2 text-3xl font-semibold">{t('auth.createAccount')}</h1><form className="mt-7 space-y-4" onSubmit={submit}><Field label={t('auth.name')}><TextInput required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} /></Field><Field label={t('auth.email')}><TextInput required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></Field><Field label={t('auth.password')}><div className="relative"><TextInput required minLength={8} type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="pr-11" /><button type="button" aria-label={t('auth.password')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted hover:text-text" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></Field><Field label={t('auth.confirmPassword')}><TextInput required type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></Field>{error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}<Button type="submit" variant="accent" className="w-full" disabled={loading}>{loading ? t('auth.loading') : t('auth.register')}</Button></form><p className="mt-6 text-center text-sm text-muted">{t('auth.haveAccount')} <Link to="/login" className="text-accent hover:underline">{t('auth.signIn')}</Link></p></Card></div></main>
}
