const PubSub = require('pubsub-js');
const $ = require('jquery');
const Stats = require('./stats');

(function () {
  const initialize = statsContainer => {
    PubSub.subscribe('board.ready', (topic, {columns}) => {
      $('#board').empty();
      $(`${statsContainer()} #workers`).empty();

      columns.forEach(column => {
        const $column = $('<li/>')
          .addClass(`column ${column.type}`)
          .attr('data-column-id', column.id)
          .append($('<h2/>').text(column.name))
          .append($('<ul/>').addClass('cards'));

        $('#board').append($column);
      });
    });

    PubSub.subscribe('workitem.added', (topic, subject) => {
      let $card = $('<li/>')
        .addClass('card')
        .attr('data-card-id', subject.item.id)
        .text(subject.item.id);

      $(`[data-column-id="${subject.column.id}"] .cards`).append($card);
    });

    PubSub.subscribe('workitem.removed', (topic, subject) => {
      let selector = `[data-column-id="${subject.column.id}"] [data-card-id="${subject.item.id}"]`;
      let $card = $(`${selector}`);
      $card.remove();
    });

    PubSub.subscribe('stats.calculated', (topic, stats) => {
      $(`${statsContainer()} .throughput`).text(round(stats.throughput));
      $(`${statsContainer()} .leadtime`).text(round(stats.leadTime));

      function renderWip(wip, maxWip) {
        if (wip === maxWip) {
          return wip;
        }
        return `${wip} (max ${maxWip})`;
      }

      $(`${statsContainer()} .wip`).text(renderWip(stats.workInProgress, stats.maxWorkInProgress));
    });

    PubSub.subscribe('worker.created', (topic, worker) => {
      const $worker = $('<li/>')
        .addClass('worker')
        .attr('data-worker-id', worker.id)
        .append($('<span/>').addClass('name').text(`${worker.name()}: `))
        .append($('<span/>').addClass('stat').text('0%'));

      $(`${statsContainer()} .workers`).append($worker)
    });

    PubSub.subscribe('worker.stats.updated', (topic, stats) => {
      var efficiency = Math.round(stats.stats.efficiency * 100)
      $(`${statsContainer()} [data-worker-id="${stats.workerId}"] .stat`)
        .text(`${efficiency}%`);
    });

    function round(number, positions = 2) {
      return Math.round(number * Math.pow(10, positions)) / Math.pow(10, positions);
    }

  };

  module.exports = {initialize};
})();
