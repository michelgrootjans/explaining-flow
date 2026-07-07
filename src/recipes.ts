export type Recipe = {
  name: string;
  workload: string;
  workers: string;
  wipLimit: string;
  numberOfStories: string;
  random: boolean;
};

const KEY = 'explaining-flow.recipes';

// The Banana Software Company demo set — baked in so a fresh visitor gets a
// ready-made lecture series. Seeded only on first visit (see seedDefaults):
// deleting them stores '[]', which is respected — they don't resurrect.
const DEFAULT_RECIPES: Recipe[] = [
  { name: 'Base Team', workload: 'po: 2, ui: 4, dev: 8, qa: 2', workers: 'po, ui, ui, dev, dev, dev, qa', wipLimit: '', numberOfStories: '100', random: true },
  { name: '2x People', workload: 'po: 2, ui: 4, dev: 8, qa: 2', workers: 'po, ui, ui, dev, dev, dev, qa, po, ui, ui, dev, dev, dev, qa', wipLimit: '', numberOfStories: '100', random: true },
  { name: '4x People', workload: 'po: 2, ui: 4, dev: 8, qa: 2', workers: 'po, ui, ui, dev, dev, dev, qa, po, ui, ui, dev, dev, dev, qa, po, ui, ui, dev, dev, dev, qa, po, ui, ui, dev, dev, dev, qa', wipLimit: '', numberOfStories: '100', random: true },
  { name: '8x People', workload: 'po: 2, ui: 4, dev: 8, qa: 2', workers: 'po, ui, ui, dev, dev, dev, qa, po, ui, ui, dev, dev, dev, qa, po, ui, ui, dev, dev, dev, qa, po, ui, ui, dev, dev, dev, qa, po, ui, ui, dev, dev, dev, qa, po, ui, ui, dev, dev, dev, qa, po, ui, ui, dev, dev, dev, qa, po, ui, ui, dev, dev, dev, qa', wipLimit: '', numberOfStories: '100', random: true },
  { name: 'WIP throttling only', workload: 'po: 2, ui: 4, dev: 8, qa: 2', workers: 'po, ui, ui, dev, dev, dev, qa', wipLimit: '7', numberOfStories: '100', random: true },
  { name: 'Cross-skilling only', workload: 'po: 2, ui: 4, dev: 8, qa: 2', workers: 'dev+ui, dev+ui, dev+qa, dev+po, ui+po, ui+qa, qa+po', wipLimit: '', numberOfStories: '100', random: true },
  { name: 'Cut Batch only', workload: 'po: 1, ui: 2, dev: 4, qa: 1', workers: 'po, ui, ui, dev, dev, dev, qa', wipLimit: '', numberOfStories: '200', random: true },
  { name: 'WIP + cx2 skill + batch', workload: 'po: 1, ui: 2, dev: 4, qa: 1', workers: 'dev+ui, dev+ui, dev+qa, dev+po, ui+po, ui+qa, qa+po', wipLimit: '7', numberOfStories: '200', random: true },
  { name: 'WIP + cx3 skill + batch', workload: 'po: 1, ui: 2, dev: 4, qa: 1', workers: 'po+ui+dev, po+ui+dev, ui+dev+qa, ui+dev+qa, po+dev+qa, po+ui+qa, po+ui+dev', wipLimit: '7', numberOfStories: '200', random: true },
  { name: 'WIP + fullstack + batch', workload: 'po: 1, ui: 2, dev: 4, qa: 1', workers: 'fullstack, fullstack, fullstack, fullstack, fullstack, fullstack, fullstack', wipLimit: '7', numberOfStories: '200', random: true },
  { name: 'Base Team (noVar)', workload: 'po: 2, ui: 4, dev: 8, qa: 2', workers: 'po, ui, ui, dev, dev, dev, qa', wipLimit: '', numberOfStories: '100', random: false },
];

const load = (): Recipe[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
};

const save = (recipes: Recipe[]) => localStorage.setItem(KEY, JSON.stringify(recipes));

const all = (): Recipe[] => load();

const find = (name: string): Recipe | undefined => load().find(r => r.name === name);

const upsert = (recipe: Recipe) => {
  if (!recipe.name.trim()) return;
  const recipes = load();
  const index = recipes.findIndex(r => r.name === recipe.name);
  if (index >= 0) recipes[index] = recipe;
  else recipes.push(recipe);
  save(recipes);
};

const remove = (name: string) => save(load().filter(r => r.name !== name));

// First visit only: the key has never been written, so bake in the demo set.
const seedDefaults = () => {
  if (localStorage.getItem(KEY) === null) save(DEFAULT_RECIPES);
};

export { all, find, upsert, remove, seedDefaults, DEFAULT_RECIPES };
