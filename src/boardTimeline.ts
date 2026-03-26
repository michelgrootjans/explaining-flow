import PubSub from 'pubsub-js';
import * as TimeAdjustments from './timeAdjustments';

let startMs: number | null = null;
let allItems: Map<number, any> = new Map();
let boardColumns: any[] = [];

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
    if (!preview) return;

    if (projectDay === null || startMs === null) {
      preview.style.display = 'none';
      return;
    }

    const speed = TimeAdjustments.multiplicator();
    const realTime = startMs + projectDay * 1000 * speed;
    const state = getStateAt(realTime);
    renderPreview(preview, state, projectDay);
    preview.style.display = '';
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

function columnDisplayName(col: any): string {
  return col.name;
}

function renderPreview(container: HTMLElement, state: Map<number, any[]>, projectDay: number) {
  const dayLabel = Math.round(projectDay * 10) / 10;

  let html = `<div class="board-preview-day">Board at day ${dayLabel}</div><div class="board-preview-columns">`;

  boardColumns.forEach((col: any) => {
    const items = state.get(col.id) || [];
    html += `
      <div class="board-preview-col ${col.type}">
        <div class="board-preview-col-header">${columnDisplayName(col)} <span class="board-preview-count">(${items.length})</span></div>
        <div class="board-preview-cards">
          ${items.map(item => `<span class="board-preview-card" style="background:${item.color}"></span>`).join('')}
        </div>
      </div>`;
  });

  html += '</div>';
  container.innerHTML = html;
}
