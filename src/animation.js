const PubSub = require('pubsub-js');
const {createElement} = require('./dom-manipulation')

const round = (number, positions = 2) => Math.round(number * Math.pow(10, positions)) / Math.pow(10, positions);
const any = array => array[Math.floor(Math.random() * array.length)];

const initialize = (currentSenarioId) => {
  PubSub.subscribe('board.ready', (topic, {columns}) => {
    document.getElementById('board').innerHTML = ''
    let $scenario = document.querySelector(`${currentSenarioId} .workers`);
    if($scenario) $scenario.innerHTML = ''

    columns.forEach(column => {
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

      document.getElementById('board').append($column)
    });
  });

  PubSub.subscribe('workitem.added', (topic, {column, item}) => {
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

  PubSub.subscribe('workitem.removed', (topic, {column, item}) => {
    let selector = `[data-column-id="${column.id}"] [data-card-id="${item.id}"]`;
    let $card = document.querySelector(selector);
    if ($card) $card.remove(); // FIXME: this check should not happen
  });

  const updateAmount = (topic, {column}) => {
    let $cards = document.querySelector(`[data-column-id="${column.id}"] .cards`);
    let $span = document.querySelector(`[data-column-id="${column.id}"] .amount`);
    if ($span) {// FIXME: this check should not happen
      $span.innerHTML = `${$cards ? $cards.childElementCount : 0}`;
    }
  }
  PubSub.subscribe('workitem.added', updateAmount);
  PubSub.subscribe('workitem.removed', updateAmount);

  const renderWip = ({averageWip, maxWorkInProgress}) => {
    const wip = round(averageWip, 1);
    if (wip === maxWorkInProgress) {
      return wip;
    }
    return `${wip} (max ${maxWorkInProgress})`;
  };

  const renderLeadTime = ({leadTime, minLeadTime, maxLeadTime}) => {
    const value = round(leadTime, 1);
    const max = round(maxLeadTime || leadTime, 1);

    if (!max) return value;
    if (value === max) return value;
    return `${value} (max ${max})`;
  };

  PubSub.subscribe('stats.calculated', (topic, stats) => {
    document.querySelector(`${currentSenarioId} .throughput`).innerHTML = round(stats.throughput);
    document.querySelector(`${currentSenarioId} .leadtime`).innerHTML = renderLeadTime(stats)
    document.querySelector(`${currentSenarioId} .wip`).innerHTML = renderWip(stats)
    document.querySelector(`${currentSenarioId} .timeWorked`).innerHTML = round(stats.timeWorked, 0);
  });

  PubSub.subscribe('worker.created', (topic, worker) => {
    const $worker = createElement({type: 'li', className: 'worker', attributes: {'data-worker-id': worker.id}})
    $worker.append(createElement({type: 'span', className: 'name', text: `${worker.name()}: `}))
    $worker.append(createElement({type: 'span', className: 'stat', text: '0%'}))

    let $workers = document.querySelector(`${currentSenarioId} .workers`);
    if ($workers) $workers.append($worker)
  });

  PubSub.subscribe('worker.stats.updated', (topic, stats) => {
    var efficiency = Math.round(stats.stats.efficiency * 100)

    let $workerEfficiency = document.querySelector(`${currentSenarioId} [data-worker-id="${stats.workerId}"] .stat`);
    if ($workerEfficiency) $workerEfficiency.innerHTML = `${efficiency}%`
  });

};

module.exports = {initialize};
