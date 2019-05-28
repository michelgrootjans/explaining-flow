const PubSub = require('pubsub-js');
const $ = require('jquery');
const Stats = require('./stats');

(function () {
  const initialize = () => {
    PubSub.subscribe('worklist.created', (topic, subject) => {
      const $column = $('<li/>')
        .addClass('column')
        .attr('data-column-id', subject.id)
        .append($('<h2/>').text(subject.name))
        .append($('<ul/>').addClass('cards'));

      $('#dashboard').append($column);

      PubSub.publish('worklist.shown', subject)
    });

    PubSub.subscribe('workitem.added', (topic, subject) => {
      let $card = $('<li/>')
        .attr('data-card-id', subject.item.id)
        .text(subject.item.id);

      $(`[data-column-id="${subject.columnId}"] .cards`).append($card);

      PubSub.publish('workitem.shown', subject)
    });

    PubSub.subscribe('workitem.removed', (topic, subject) => {
      let selector = `[data-column-id="${subject.columnId}"] [data-card-id="${subject.item.id}"]`;
      let $card = $(`${selector}`);
      $card.remove();
    });

    PubSub.subscribe('workitem.done', (topic, items) => {
      const stats = new Stats(items);
      $('#throughput').text(Math.round(stats.throughput*100)/100);
      $('#leadtime').text(Math.round(stats.leadTime*100)/100);
    })
  };

  module.exports = {initialize};
})();