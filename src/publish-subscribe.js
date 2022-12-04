const PubSub = require("pubsub-js");

module.exports = {
    publish: (topic, message) => PubSub.publish(topic, {timestamp: new Date(), ...message}),
    subscribe: PubSub.subscribe,
    clearAllSubscriptions: PubSub.clearAllSubscriptions,
}