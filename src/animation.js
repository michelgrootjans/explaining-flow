const PubSub = require('pubsub-js');
const $ = require('jquery');

(function () {
  const initialize = () => {
    PubSub.subscribe('worklist.created', (topic, subject) => {
      const $column = $('<li/>');

      console.log({topic, subject})

      $('#dashboard').append($column);
      $column.addClass('column');
      $column.attr('data-column-id', subject.id);
      $column.append($('<h2/>').text(subject.name));
      $column.append($('<ul/>').addClass('cards'));
      PubSub.publish('worklist.shown', subject)
    });

    PubSub.subscribe('workitem.added', (topic, subject) => {
      let $card = $('<li/>').text(subject.item.id);

      $(`li .cards`).append($card);

      PubSub.publish('workitem.shown', subject)
    });
  };

  module.exports = {initialize};
})();