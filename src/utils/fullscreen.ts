type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void> | void
}
type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void
}

export function isNativeFullscreen(): boolean {
  const doc = document as FullscreenDocument
  return Boolean(doc.fullscreenElement || doc.webkitFullscreenElement)
}

export async function enterNativeFullscreen(): Promise<boolean> {
  const element = document.documentElement as FullscreenElement
  try {
    if (element.requestFullscreen) await element.requestFullscreen()
    else if (element.webkitRequestFullscreen) await element.webkitRequestFullscreen()
    else return false
    return isNativeFullscreen()
  } catch {
    return false
  }
}

export async function exitNativeFullscreen(): Promise<void> {
  const doc = document as FullscreenDocument
  if (!isNativeFullscreen()) return
  try {
    if (doc.exitFullscreen) await doc.exitFullscreen()
    else await doc.webkitExitFullscreen?.()
  } catch {
    // Browser fullscreen may already have been closed using system controls.
  }
}
