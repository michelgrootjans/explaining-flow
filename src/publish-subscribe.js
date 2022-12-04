const PubSub = require("pubsub-js");

module.exports = {
    ...PubSub,
    publish: (topic, message) => PubSub.publish(topic, {timestamp: new Date(), ...message}),
}