import { expect, test } from '@playwright/test'

test('draws a digit, runs real inference, and plays cinematic timeline', async ({ page }) => {
  await page.goto('/', { waitUntil: 'commit' })
  await expect(page.getByRole('heading', { name: /CNN Visual Lab/i })).toBeVisible({ timeout: 15000 })
  await expect(page.getByRole('heading', { name: 'Input Geometry' })).toBeVisible()

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

  await page.getByRole('button', { name: /Run Simulation/i }).click()

  // Interact with next navigation
  await page.getByRole('button', { name: /NEXT/i }).click()
  await expect(page.getByText(/STAGE 02/i)).toBeVisible()

  // Reset — navigate to last stage, then finish & restart
  for (let i = 0; i < 10; i++) {
    await page.getByRole('button', { name: /NEXT/i }).click()
  }
  await page.getByRole('button', { name: /FINISH & RESTART/i }).click()
  await expect(page.getByRole('button', { name: /Run Simulation/i })).toBeDisabled()
})

test('supports reduced motion and responsive tablet and phone layouts', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const viewport of [{ width: 768, height: 1024 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport)
    await page.goto('/', { waitUntil: 'commit' })
    await expect(page.getByRole('heading', { name: /CNN Visual Lab/i })).toBeVisible()
    await expect(page.locator('canvas').first()).toBeVisible()
  }
})
