// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Helper: run a simulation with given parameters and return the stats.
 * This is the primary interaction point for AI agents verifying simulation behavior.
 */
async function runSimulation(page, { workload, workers, wipLimit = '', numberOfStories = '', random = false } = {}) {
  await page.goto('/');

  if (workload !== undefined) {
    await page.fill('#workload', workload);
  }
  if (workers !== undefined) {
    await page.fill('#workers', workers);
  }
  await page.fill('#wip-limit', wipLimit);
  if (numberOfStories) {
    await page.fill('#numberOfStories', numberOfStories);
  }

  const randomCheckbox = page.locator('#random');
  const isChecked = await randomCheckbox.isChecked();
  if (random !== isChecked) {
    await randomCheckbox.click();
  }

  await page.click('#create-scenario');

  // Wait for a scenario result to appear
  await page.waitForSelector('.scenario.instance', { timeout: 10000 });
  // Wait for the simulation to complete (setup.js adds 'done' class on board.done event)
  await page.waitForSelector('.scenario.instance.done', { timeout: 60000 });

  return readStats(page);
}

/**
 * Read stats from the most recently added scenario panel.
 */
async function readStats(page) {
  const scenario = page.locator('.scenario.instance').last();
  return {
    title: await scenario.locator('.scenario-title').textContent(),
    throughput: await scenario.locator('.throughput').textContent(),
    leadtime: await scenario.locator('.leadtime').textContent(),
    wip: await scenario.locator('.wip').textContent(),
    timeWorked: await scenario.locator('.timeWorked').textContent(),
    workers: await scenario.locator('.workers').textContent(),
  };
}

/**
 * Parse a numeric value from a stat string like "1.00 stories/day" → 1.0
 */
function parseStatValue(text) {
  const match = (text || '').match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

// ─── Basic smoke test ────────────────────────────────────────────────────────

test('app loads and shows the simulation form', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#create-scenario')).toBeVisible();
  await expect(page.locator('#workload')).toBeVisible();
  await expect(page.locator('#workers')).toBeVisible();
});

// ─── Single developer, predictable workload ──────────────────────────────────

test('single developer with predictable workload produces throughput ~1', async ({ page }) => {
  // Use >= 100 stories to trigger speed=20 mode (50ms per unit instead of 1000ms)
  const stats = await runSimulation(page, {
    workload: 'dev: 1',
    workers: 'dev',
    numberOfStories: '100',
    random: false,
  });

  const throughput = parseStatValue(stats.throughput);
  // In speed=20 mode the real-time measurement has more variance; expect within ±30% of 1
  expect(throughput).toBeGreaterThan(0.7);
  expect(throughput).toBeLessThan(1.3);
});

// ─── Multiple scenarios comparison ───────────────────────────────────────────

test('adding WIP limit reduces cycle time compared to no WIP limit', async ({ page }) => {
  test.setTimeout(120000);
  // Run without WIP limit (200 stories → speed=20 mode)
  const withoutWip = await runSimulation(page, {
    workload: 'ux: 1, dev: 3, qa: 2',
    workers: 'ux, dev, qa',
    numberOfStories: '200',
    random: false,
    wipLimit: '',
  });

  // Add second scenario with WIP limit
  const withWip = await runSimulation(page, {
    workload: 'ux: 1, dev: 3, qa: 2',
    workers: 'ux, dev, qa',
    numberOfStories: '200',
    random: false,
    wipLimit: '10',
  });

  const cycleWithout = parseStatValue(withoutWip.leadtime);
  const cycleWith = parseStatValue(withWip.leadtime);

  // WIP limit should significantly reduce cycle time
  expect(cycleWith).toBeLessThan(cycleWithout);
});

// ─── Board visibility ─────────────────────────────────────────────────────────

test('board columns are visible after running simulation', async ({ page }) => {
  await runSimulation(page, {
    workload: 'dev: 1',
    workers: 'dev',
    numberOfStories: '100',
    random: false,
  });

  // Board should have columns rendered
  await expect(page.locator('#board')).toBeVisible();
  const columns = page.locator('#board .col');
  await expect(columns.first()).toBeVisible();
});

// ─── Chart visibility ─────────────────────────────────────────────────────────

test('CFD and line charts are rendered after simulation', async ({ page }) => {
  await runSimulation(page, {
    workload: 'dev: 1',
    workers: 'dev',
    numberOfStories: '100',
    random: false,
  });

  await expect(page.locator('#cfd')).toBeVisible();
  await expect(page.locator('#lineChart')).toBeVisible();
});
