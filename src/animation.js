const PubSub = require('pubsub-js');
const $ = require('jquery');
const {createElement} = require('./dom-manipulation')

const round = (number, positions = 2) => Math.round(number * Math.pow(10, positions)) / Math.pow(10, positions);

const initialize = (currentSenarioId) => {
  PubSub.subscribe('board.ready', (topic, {columns}) => {
    $('#board').empty();
    $(`${currentSenarioId} .workers`).empty();

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
    let $card = $('<li/>')
      .addClass('card')
      .attr('data-card-id', item.id)
      .text(item.id);

    // $(`[data-column-id="${column.id}"] .cards`).append($card);
    let $column = document.querySelector(`[data-column-id="${column.id}"] .cards`);
    if ($column) $column.append($card.get(0)); // FIXME: this check should not happen
  });

  PubSub.subscribe('workitem.removed', (topic, {column, item}) => {
    let selector = `[data-column-id="${column.id}"] [data-card-id="${item.id}"]`;
    let $card = $(`${selector}`);
    $card.remove();
  });

  const renderWip = ({workInProgress, maxWorkInProgress}) => {
    if (workInProgress === maxWorkInProgress) {
      return workInProgress;
    }
    return `${workInProgress} (max ${maxWorkInProgress})`;
  };

  PubSub.subscribe('stats.calculated', (topic, stats) => {
    $(`${currentSenarioId} .throughput`).text(round(stats.throughput));
    $(`${currentSenarioId} .leadtime`).text(round(stats.leadTime));
    $(`${currentSenarioId} .wip`).text(renderWip(stats));
  });

  PubSub.subscribe('worker.created', (topic, worker) => {
    const $worker = $('<li/>')
      .addClass('worker')
      .attr('data-worker-id', worker.id)
      .append($('<span/>').addClass('name').text(`${worker.name()}: `))
      .append($('<span/>').addClass('stat').text('0%'));

    $(`${currentSenarioId} .workers`).append($worker)
  });

  PubSub.subscribe('worker.stats.updated', (topic, stats) => {
    var efficiency = Math.round(stats.stats.efficiency * 100)
    $(`${currentSenarioId} [data-worker-id="${stats.workerId}"] .stat`)
      .text(`${efficiency}%`);
  });

};

module.exports = {initialize};
