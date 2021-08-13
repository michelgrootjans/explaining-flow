const PubSub = require('pubsub-js');
const $ = require('jquery');
const {createElement} = require('./dom-manipulation')

const round = (number, positions = 2) => Math.round(number * Math.pow(10, positions)) / Math.pow(10, positions);

const initialize = (currentSenarioId) => {
  PubSub.subscribe('board.ready', (topic, {columns}) => {
    document.getElementById('board').innerHTML = ''
    let $scenario = document.querySelector(`${currentSenarioId} .workers`);
    if($scenario) $scenario.innerHTML = ''

    columns.forEach(column => {
      const $column = createElement({
        type: 'li',
        className: `column ${column.type}`,
        attributes: {'data-column-id': column.id}
      })
      $column.append(createElement({type: 'h2', text: column.name}))
      $column.append(createElement({type: 'ul', className: 'cards'}))

      document.getElementById('board').append($column)
    });
  });

  PubSub.subscribe('workitem.added', (topic, {column, item}) => {
    let $card = createElement({
      type: 'li',
      className: 'card',
      text: item.id,
      attributes:{'data-card-id': item.id}})

    let $column = document.querySelector(`[data-column-id="${column.id}"] .cards`);
    if ($column) $column.append($card); // FIXME: this check should not happen
  });

  PubSub.subscribe('workitem.removed', (topic, {column, item}) => {
    let selector = `[data-column-id="${column.id}"] [data-card-id="${item.id}"]`;
    let $card = document.querySelector(selector);
    if ($card) $card.remove(); // FIXME: this check should not happen
  });

  const renderWip = ({workInProgress, maxWorkInProgress}) => {
    if (workInProgress === maxWorkInProgress) {
      return workInProgress;
    }
    return `${workInProgress} (max ${maxWorkInProgress})`;
  };

  PubSub.subscribe('stats.calculated', (topic, stats) => {
    document.querySelector(`${currentSenarioId} .throughput`).innerHTML = round(stats.throughput);
    document.querySelector(`${currentSenarioId} .leadtime`).innerHTML = round(stats.leadTime)
    document.querySelector(`${currentSenarioId} .wip`).innerHTML = renderWip(stats)
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
    $(`${currentSenarioId} [data-worker-id="${stats.workerId}"] .stat`)
      .text(`${efficiency}%`);
  });

};

module.exports = {initialize};
