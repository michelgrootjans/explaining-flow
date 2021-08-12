const PubSub = require('pubsub-js');
const $ = require('jquery');

const round = (number, positions = 2) => Math.round(number * Math.pow(10, positions)) / Math.pow(10, positions);

const initialize = (currentSenarioId) => {
    PubSub.subscribe('board.ready', (topic, {columns}) => {
        debugger
      $('#board').empty();
      $(`${currentSenarioId} .workers`).empty();

      columns.forEach(column => {
        const $column = $('<li/>')
          .addClass(`column ${column.type}`)
          .attr('data-column-id', column.id)
          .append($('<h2/>').text(column.name))
          .append($('<ul/>').addClass('cards'));

        $('#board').append($column);
      });
    });

    PubSub.subscribe('workitem.added', (topic, {column, item}) => {
      let $card = $('<li/>')
        .addClass('card')
        .attr('data-card-id', item.id)
        .text(item.id);

      $(`[data-column-id="${column.id}"] .cards`).append($card);
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
        debugger
        $(`${currentSenarioId} .throughput`).text(round(stats.throughput));
        $(`${currentSenarioId} .leadtime`).text(round(stats.leadTime));
        $(`${currentSenarioId} .wip`).text(renderWip(stats));
    });

    PubSub.subscribe('worker.created', (topic, worker) => {
        debugger
      const $worker = $('<li/>')
        .addClass('worker')
        .attr('data-worker-id', worker.id)
        .append($('<span/>').addClass('name').text(`${worker.name()}: `))
        .append($('<span/>').addClass('stat').text('0%'));

      $(`${currentSenarioId} .workers`).append($worker)
    });

    PubSub.subscribe('worker.stats.updated', (topic, stats) => {
        debugger
      var efficiency = Math.round(stats.stats.efficiency * 100)
      $(`${currentSenarioId} [data-worker-id="${stats.workerId}"] .stat`)
        .text(`${efficiency}%`);
    });

  };

  module.exports = {initialize};
