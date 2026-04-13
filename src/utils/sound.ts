/**
 * Plays a short triple-beep using the Web Audio API.
 * No audio file assets needed — works fully offline in the PWA.
 */
export function playTimerSound(): void {
  try {
    const ctx = new AudioContext()

    const playBeep = (startTime: number, duration: number, frequency: number, gain: number) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(frequency, startTime)

      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.01)
      gainNode.gain.setValueAtTime(gain, startTime + duration - 0.01)
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration)

      oscillator.start(startTime)
      oscillator.stop(startTime + duration)
    }

    const now = ctx.currentTime
    // Three ascending beeps: 660Hz, 770Hz, 880Hz
    playBeep(now + 0.0,  0.12, 660, 0.4)
    playBeep(now + 0.18, 0.12, 770, 0.4)
    playBeep(now + 0.36, 0.20, 880, 0.6)

    // Close context after sounds finish to free resources
    setTimeout(() => ctx.close(), 800)
  } catch {
    // Web Audio API not available (e.g. SSR or restricted environment) — fail silently
  }
}
