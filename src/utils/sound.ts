let audioContext: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!audioContext) audioContext = new Ctor()
  return audioContext
}

export async function playChime(): Promise<void> {
  const ctx = getContext()
  if (!ctx) return
  if (ctx.state === 'suspended') {
    await ctx.resume()
  }

  const now = ctx.currentTime
  const notes = [523.25, 659.25, 783.99]

  notes.forEach((freq, index) => {
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = freq
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.07, now + 0.02 + index * 0.12)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35 + index * 0.12)
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.start(now + index * 0.12)
    oscillator.stop(now + 0.4 + index * 0.12)
  })
}
