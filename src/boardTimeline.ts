import PubSub from 'pubsub-js';
import * as TimeAdjustments from './timeAdjustments';

const rotations = ['left-2', 'left', 'none', 'right', 'right-2'];

let startMs: number | null = null;
let allItems: Map<number, any> = new Map();
let boardColumns: any[] = [];

export function getState() {
  return { startMs, allItems, boardColumns };
}

export function restoreState(state: { startMs: number | null; allItems: Map<number, any>; boardColumns: any[] }) {
  startMs = state.startMs;
  allItems = state.allItems;
  boardColumns = state.boardColumns;
}

export function initialize() {
  startMs = null;
  allItems = new Map();
  boardColumns = [];

  PubSub.subscribe('board.ready', (topic: string, {columns}: any) => {
    startMs = Date.now();
    allItems = new Map();
    boardColumns = columns;
  });

  PubSub.subscribe('workitem.added', (topic: string, {item, column}: any) => {
    if (!item.columnHistory) item.columnHistory = [];
    item.columnHistory.push({columnId: column.id, time: Date.now()});
    allItems.set(item.id, item);
  });

  PubSub.subscribe('crosshair.moved', (topic: string, {projectDay}: any) => {
    const preview = document.getElementById('board-preview');
    const live = document.getElementById('board');
    if (!preview || !live) return;

    if (projectDay === null || startMs === null) {
      preview.style.display = 'none';
      live.style.display = '';
      return;
    }

    const speed = TimeAdjustments.multiplicator();
    const realTime = startMs + projectDay * 1000 * speed;
    renderPreview(preview, getStateAt(realTime), projectDay);
    preview.style.display = '';
    live.style.display = 'none';
  });
}

function getStateAt(realTime: number): Map<number, any[]> {
  const state = new Map<number, any[]>();
  boardColumns.forEach((col: any) => state.set(col.id, []));

  allItems.forEach(item => {
    const history: any[] = item.columnHistory || [];
    let lastColumnId: number | null = null;
    for (const entry of history) {
      if (entry.time <= realTime) lastColumnId = entry.columnId;
      else break;
    }
    if (lastColumnId !== null) {
      const arr = state.get(lastColumnId);
      if (arr) arr.push(item);
    }
  });

  return state;
}

function renderPreview(container: HTMLElement, state: Map<number, any[]>, projectDay: number) {
  const dayLabel = Math.round(projectDay * 10) / 10;

  let columnsHtml = '';
  boardColumns.forEach((col: any) => {
    const items = state.get(col.id) || [];
    const cards = items.map(item =>
      `<li class="post-it rotate-${rotations[item.id % rotations.length]}" style="background:${item.color}"></li>`
    ).join('');
    columnsHtml += `
      <div class="col col-1 ${col.type}">
        <h5>${col.name}<span class="amount">${items.length}</span></h5>
        <ul class="cards">${cards}</ul>
      </div>`;
  });

  container.innerHTML = `
    <div class="board-preview-label">Day ${dayLabel}</div>
    <div class="board row board-preview-board">${columnsHtml}</div>`;
}
