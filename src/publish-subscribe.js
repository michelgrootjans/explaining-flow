const PubSub = require("pubsub-js");

module.exports = {
    ...PubSub,
    publish: (topic, message) => {
        message.timestamp = message.timestamp || Date.now();
        PubSub.publish(topic, message);
    },
}