import { test, expect, Page } from '@playwright/test';

// Stuck-card hunt: run demo recipes repeatedly in a real browser and after each
// run classify the end state:
//   A) DOM ghost   — scenario marked done, but a card remains in a live queue
//   B) preview up  — #board-preview visible instead of the live board
//   C) logical strand — run never reaches done
test.use({ baseURL: process.env.STRESS_BASE_URL || 'http://localhost:5273' });

const BASE = 'po, ui, ui, dev, dev, dev, qa';
const teamX = (n: number) => Array(n).fill(BASE).join(', ');

async function runRecipe(page: Page, recipeName: string, wiggle: boolean, runIndex: number) {
  if (recipeName.startsWith('scale:')) {
    const n = parseInt(recipeName.slice(6));
    await page.fill('#scenario-name', `${n}x custom`);
    await page.fill('#workload', 'po: 2, ui: 4, dev: 8, qa: 2');
    await page.fill('#workers', teamX(n));
    await page.fill('#wip-limit', '');
    await page.fill('#numberOfStories', '100');
    const checked = await page.locator('#random').isChecked();
    if (!checked) await page.locator('#random').click();
  } else {
    await page.selectOption('#recipe-select', recipeName);
  }
  await page.click('#create-scenario');
  await page.waitForSelector('.scenario.instance.selected', { timeout: 10000 });

  const started = Date.now();
  let done = false;
  while (Date.now() - started < 90000) {
    done = await page.evaluate(() =>
      document.querySelector('.scenario.instance.selected')?.classList.contains('done') ?? false);
    if (done) break;
    if (wiggle) {
      const box = await page.locator('#lineChart').boundingBox();
      if (box) {
        const x = box.x + Math.random() * box.width;
        const y = box.y + Math.random() * box.height;
        await page.mouse.move(x, y, { steps: 3 });
      }
      if (Math.random() < 0.3) await page.mouse.move(10, 10); // off the chart
    }
    await page.waitForTimeout(wiggle ? 150 : 400);
  }

  // settle: let trailing timeouts/pubsub deliveries drain, then park the mouse
  // off the charts so only a genuinely stuck preview counts as stuck
  await page.waitForTimeout(1200);
  await page.mouse.move(10, 10);
  await page.waitForTimeout(400);

  const state = await page.evaluate(() => {
    const cols = [...document.querySelectorAll('#board .col')].map(col => ({
      name: col.querySelector('h5')?.childNodes[0]?.textContent?.trim() ?? '?',
      cls: col.className,
      cards: col.querySelectorAll('.cards li').length,
    }));
    const preview = document.getElementById('board-preview');
    const board = document.getElementById('board');
    return {
      cols,
      previewShown: preview ? getComputedStyle(preview).display !== 'none' : false,
      boardHidden: board ? getComputedStyle(board).display === 'none' : false,
    };
  });

  const leftovers = state.cols.filter(c => !c.cls.includes('done') && c.cards > 0);
  const verdict = !done ? 'C-LOGICAL-STRAND'
    : state.previewShown || state.boardHidden ? 'B-PREVIEW-STUCK'
    : leftovers.length ? 'A-DOM-GHOST'
    : 'clean';

  console.log(`run ${runIndex} [${recipeName}] wiggle=${wiggle} done=${done} verdict=${verdict}` +
    (verdict !== 'clean' ? ' state=' + JSON.stringify(state) : ''));
  return verdict;
}

test('hunt stuck cards across repeated runs', async ({ page }) => {
  test.setTimeout(900000);
  page.on('pageerror', err => console.log('PAGEERROR:', err.message));
  page.on('console', msg => { if (msg.type() === 'error') console.log('CONSOLE:', msg.text()); });

  await page.goto('/');
  await page.waitForSelector('#create-scenario');

  const verdicts: string[] = [];
  const plan: Array<[string, boolean]> = [
    ['8x People', false], ['8x People', false], ['scale:16', false],
    ['8x People', true], ['scale:16', false], ['8x People', false],
  ];
  for (let i = 0; i < plan.length; i++) {
    verdicts.push(await runRecipe(page, plan[i][0], plan[i][1], i));
  }
  console.log('VERDICTS:', JSON.stringify(verdicts));
  expect(verdicts.every(v => v === 'clean')).toBe(true);
});

test('WIP limit is never exceeded (max WIP stat <= limit)', async ({ page }) => {
  test.setTimeout(600000);
  await page.goto('/');
  await page.waitForSelector('#create-scenario');
  const maxes: number[] = [];
  for (let i = 0; i < 4; i++) {
    await page.selectOption('#recipe-select', 'WIP + cx2 skill + batch');
    await page.click('#create-scenario');
    await page.waitForSelector('.scenario.instance.selected', { timeout: 10000 });
    await page.waitForSelector('.scenario.instance.selected.done', { timeout: 120000 });
    const wipText = await page.locator('.scenario.instance.selected .wip').textContent();
    // renderWip shows "avg (max N)" when max differs from avg, else just the avg
    const m = wipText?.match(/max\s+([\d.]+)/);
    const maxWip = m ? parseFloat(m[1]) : parseFloat(wipText || '0');
    maxes.push(maxWip);
    console.log(`wip-run ${i}: stat="${wipText}" max=${maxWip}`);
  }
  console.log('MAXES:', JSON.stringify(maxes));
  expect(maxes.every(v => v <= 7)).toBe(true);
});
