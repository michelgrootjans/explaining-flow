// TEMP stress harness: hunt for stranded cards in mid-board queues.
import PubSub from 'pubsub-js';
import Scenario from '../src/scenario';
import { LimitBoardWip } from '../src/strategies';
import { parseInput } from '../src/parsing';

const BASE = 'po, ui, ui, dev, dev, dev, qa';
const times = (n: number) => Array(n).fill(BASE).join(', ');
const RECIPES = [
  { name: 'Base Team', workload: 'po: 2, ui: 4, dev: 8, qa: 2', workers: BASE, wipLimit: '', numberOfStories: '30', random: true },
  { name: 'WIP throttling only', workload: 'po: 2, ui: 4, dev: 8, qa: 2', workers: BASE, wipLimit: '7', numberOfStories: '30', random: true },
  { name: 'Cross-skilling only', workload: 'po: 2, ui: 4, dev: 8, qa: 2', workers: 'dev+ui, dev+ui, dev+qa, dev+po, ui+po, ui+qa, qa+po', wipLimit: '', numberOfStories: '30', random: true },
  { name: '8x People', workload: 'po: 2, ui: 4, dev: 8, qa: 2', workers: times(8), wipLimit: '', numberOfStories: '100', random: true },
  { name: '16x People', workload: 'po: 2, ui: 4, dev: 8, qa: 2', workers: times(16), wipLimit: '', numberOfStories: '100', random: true },
];

describe('stranded card hunt', () => {
  beforeEach(PubSub.clearAllSubscriptions);
  beforeEach(jest.useFakeTimers);

  RECIPES.forEach(recipe => {
    it(`${recipe.name}: no cards stranded over 150 runs`, () => {
      for (let i = 0; i < 150; i++) {
        PubSub.clearAllSubscriptions();
        const wipLimiter = LimitBoardWip();
        const scenario = Scenario(parseInput({ title: recipe.name, ...recipe }));
        wipLimiter.initialize(scenario.wipLimit);
        const board = scenario.run();

        // Drain: advance far beyond any plausible total duration.
        jest.advanceTimersByTime(1000 * 60 * 60);
        jest.runAllTimers();

        if (!board.done()) {
          const state = board.columns().map((c: any) => ({
            name: c.name, type: c.type, count: c.size(),
            items: c.items().map((it: any) => ({ id: it.id, work: it.work }))
          })).filter((c: any) => c.type !== 'done' && c.count > 0);
          console.log(`RUN ${i} STRANDED in ${recipe.name}:`, JSON.stringify(state, null, 1));
          expect(board.done()).toBe(true); // fail loudly
        }
      }
    });
  });
});

describe('WIP limit conformance', () => {
  beforeEach(PubSub.clearAllSubscriptions);
  beforeEach(jest.useFakeTimers);

  it('never exceeds the configured WIP limit, even during bursts', () => {
    for (let i = 0; i < 100; i++) {
      PubSub.clearAllSubscriptions();
      let inFlight = 0, maxInFlight = 0;
      PubSub.subscribe('workitem.started', () => { inFlight++; if (inFlight > maxInFlight) maxInFlight = inFlight; });
      PubSub.subscribe('workitem.finished', () => { inFlight--; });

      const wipLimiter = LimitBoardWip();
      const scenario = Scenario(parseInput({
        title: 'WIP throttling only', workload: 'po: 2, ui: 4, dev: 8, qa: 2',
        workers: 'po, ui, ui, dev, dev, dev, qa', wipLimit: '7', numberOfStories: '30', random: true,
      }));
      wipLimiter.initialize(scenario.wipLimit);
      const board = scenario.run();
      jest.advanceTimersByTime(1000 * 60 * 60);
      jest.runAllTimers();

      expect(board.done()).toBe(true);
      if (maxInFlight > 7) {
        console.log(`RUN ${i}: WIP limit 7 exceeded, max in flight = ${maxInFlight}`);
        expect(maxInFlight).toBeLessThanOrEqual(7);
      }
    }
  });
});
