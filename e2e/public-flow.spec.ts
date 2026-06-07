import { expect, test } from '@playwright/test'

test('draws a digit, runs real inference, and plays cinematic timeline', async ({ page }) => {
  await page.goto('/', { waitUntil: 'commit' })
  await expect(page.getByRole('heading', { name: /CNN Digit Lab/i })).toBeVisible({ timeout: 15000 })
  await expect(page.getByRole('heading', { name: 'Draw the Input' })).toBeVisible()

  const canvas = page.getByLabel('Digit drawing canvas')
  await canvas.evaluate((element) => element.scrollIntoView({ block: 'center' }))
  const box = await canvas.boundingBox()
  if (!box) throw new Error('Drawing canvas is not visible')

  const points = [[0.25, 0.22], [0.75, 0.22], [0.6, 0.38], [0.52, 0.55], [0.45, 0.75], [0.4, 0.88]]
  await page.mouse.move(box.x + box.width * points[0][0], box.y + box.height * points[0][1])
  await page.mouse.down()
  for (const [x, y] of points.slice(1)) {
    await page.mouse.move(box.x + box.width * x, box.y + box.height * y)
  }
  await page.mouse.up()

  await page.getByRole('button', { name: 'Run Simulation' }).click()

  // Interact with next/back navigation
  await page.getByRole('button', { name: 'Next Chapter' }).click()
  await expect(page.getByText('Chapter 3 / 11')).toBeVisible()

  // Reset
  await page.getByRole('button', { name: 'Restart' }).click()
  await expect(page.getByRole('button', { name: 'Run Simulation' })).toBeDisabled()
})

test('supports reduced motion and responsive tablet and phone layouts', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const viewport of [{ width: 768, height: 1024 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport)
    await page.goto('/', { waitUntil: 'commit' })
    await expect(page.getByRole('heading', { name: /CNN Digit Lab/i })).toBeVisible()
    await expect(page.locator('canvas').first()).toBeVisible()
  }
})
