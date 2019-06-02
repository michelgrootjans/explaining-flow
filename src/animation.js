const PubSub = require('pubsub-js');
const $ = require('jquery');
const Stats = require('./stats');

(function () {
  const initialize = () => {
    PubSub.subscribe('board.ready', (topic, {columns}) => {
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
      $('#throughput').text(Math.round(stats.throughput * 100) / 100);
      $('#leadtime').text(Math.round(stats.leadTime * 100) / 100);
      $('#wip').text(stats.workInProgress);
    });

  };

  module.exports = {initialize};
})();
