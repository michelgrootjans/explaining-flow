const PubSub = require('pubsub-js');
const $ = require('jquery');

(function(){
  PubSub.subscribe('worklist.created', (topic, subject) => {
    const $column = $('<li/>').addClass('column').data('column-id', subject.id)
      .append($('<h2/>').text(subject.name))
      .append($('<ul/>').addClass('cards'));

    $('#dashboard').append($column);
    PubSub.publish('worklist.shown', subject)
  });
})();