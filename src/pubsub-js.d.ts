declare module 'pubsub-js' {
  type SubscriberCallback<T = any> = (msg: string, data: T) => void;

  export function publish<T = any>(message: string, data?: T): boolean;
  export function subscribe<T = any>(message: string, subscriber: SubscriberCallback<T>): string;
  export function unsubscribe(token: string | SubscriberCallback): void;
  export function clearAllSubscriptions(): void;

  const PubSub: {
    publish: typeof publish;
    subscribe: typeof subscribe;
    unsubscribe: typeof unsubscribe;
    clearAllSubscriptions: typeof clearAllSubscriptions;
  };
  export default PubSub;
}
