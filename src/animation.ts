import PubSub from 'pubsub-js';
import { createElement } from './dom-manipulation';

const round = (number: number, positions = 2) => Math.round(number * Math.pow(10, positions)) / Math.pow(10, positions);
const any = (array: string[]) => array[Math.floor(Math.random() * array.length)];

const initialize = (currentSenarioId: string) => {
  PubSub.subscribe('board.ready', (topic: string, {columns}: any) => {
    document.getElementById('board')!.innerHTML = ''
    let $scenario = document.querySelector(`${currentSenarioId} .workers`);
    if($scenario) $scenario.innerHTML = ''

    columns.forEach((column: any) => {
      const $column = createElement({
        type: 'div',
        className: `col col-1 ${column.type}`,
        attributes: {'data-column-id': column.id}
      })

      const $header = createElement({type: 'h5', text: column.name });
      $header.append(createElement({type : 'span', className: 'amount', text: '0' }));

      $column.append($header);
      $column.append($header);
      $column.append(createElement({type: 'ul', className: 'cards'}))

      document.getElementById('board')!.append($column)
    });
  });

  PubSub.subscribe('workitem.added', (topic: string, {column, item}: any) => {
    const rotation = any(['left-2', 'left', 'none', 'right', 'right-2']);
    let $card = createElement({
      type: 'li',
      className: `post-it rotate-${rotation}`,
      attributes:{'data-card-id': item.id},
      style: `background: ${item.color};`
    })

    let $column = document.querySelector(`[data-column-id="${column.id}"] .cards`);
    if ($column) $column.append($card); // FIXME: this check should not happen
  });

  PubSub.subscribe('workitem.removed', (topic: string, {column, item}: any) => {
    let selector = `[data-column-id="${column.id}"] [data-card-id="${item.id}"]`;
    let $card = document.querySelector(selector);
    if ($card) $card.remove(); // FIXME: this check should not happen
  });

  const updateAmount = (topic: string, {column}: any) => {
    let $cards = document.querySelector(`[data-column-id="${column.id}"] .cards`);
    let $span = document.querySelector(`[data-column-id="${column.id}"] .amount`);
    if ($span) {// FIXME: this check should not happen
      $span.innerHTML = `${$cards ? $cards.childElementCount : 0}`;
    }
  }
  PubSub.subscribe('workitem.added', updateAmount);
  PubSub.subscribe('workitem.removed', updateAmount);

  const renderWip = ({averageWip, maxWorkInProgress}: any) => {
    const wip = round(averageWip, 1);
    if (wip === maxWorkInProgress) {
      return wip;
    }
    return `${wip} (max ${maxWorkInProgress})`;
  };

  const renderLeadTime = ({leadTime, minLeadTime, maxLeadTime}: any) => {
    const value = round(leadTime, 1);
    const max = round(maxLeadTime || leadTime, 1);

    if (!max) return value;
    if (value === max) return value;
    return `${value} (max ${max})`;
  };

  PubSub.subscribe('stats.calculated', (topic: string, stats: any) => {
    document.querySelector(`${currentSenarioId} .throughput`)!.innerHTML = String(round(stats.throughput));
    document.querySelector(`${currentSenarioId} .leadtime`)!.innerHTML = String(renderLeadTime(stats));
    document.querySelector(`${currentSenarioId} .wip`)!.innerHTML = String(renderWip(stats));
    document.querySelector(`${currentSenarioId} .timeWorked`)!.innerHTML = String(round(stats.timeWorked, 0));
  });

  PubSub.subscribe('worker.created', (topic: string, worker: any) => {
    const $worker = createElement({type: 'li', className: 'worker', attributes: {'data-worker-id': worker.id}})
    $worker.append(createElement({type: 'span', className: 'name', text: `${worker.name()}: `}))
    $worker.append(createElement({type: 'span', className: 'stat', text: '0%'}))

    let $workers = document.querySelector(`${currentSenarioId} .workers`);
    if ($workers) $workers.append($worker)
  });

  PubSub.subscribe('worker.stats.updated', (topic: string, stats: any) => {
    var efficiency = Math.round(stats.stats.efficiency * 100)

    let $workerEfficiency = document.querySelector(`${currentSenarioId} [data-worker-id="${stats.workerId}"] .stat`);
    if ($workerEfficiency) $workerEfficiency.innerHTML = `${efficiency}%`
  });

};

export { initialize };
