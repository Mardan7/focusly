export async function prepareAvatar(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('invalid-avatar')
  const image = await createImageBitmap(file)
  try {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 256
    const context = canvas.getContext('2d')
    if (!context) throw new Error('invalid-avatar')
    const size = Math.min(image.width, image.height)
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, 256, 256)
    context.drawImage(image, (image.width - size) / 2, (image.height - size) / 2, size, size, 0, 0, 256, 256)
    return canvas.toDataURL('image/jpeg', 0.85)
  } finally {
    image.close()
  }
}
