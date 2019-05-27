require('./animation').initialize();
const {Worker, WorkItem, WorkList} = require('./worker');

let inbox = new WorkList('inbox');
let inProgress = new WorkList('in progress');
let outbox = new WorkList('outbox');

inbox.add(new WorkItem(1000));
// inbox.add(new WorkItem(1000));
// inbox.add(new WorkItem(1000));
// inbox.add(new WorkItem(1000));
// inbox.add(new WorkItem(1000));
// inbox.add(new WorkItem(1000));

new Worker(inbox, inProgress, outbox).work();