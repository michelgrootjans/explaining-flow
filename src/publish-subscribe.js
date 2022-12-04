const PubSub = require("pubsub-js");

module.exports = {
    ...PubSub,
    publish: (topic, message) => PubSub.publish(topic, {timestamp: Date.now(), ...message}),
}