const {Worker, WorkItem, WorkList} = require('./worker');

inbox = new WorkList();
inProgress = new WorkList();
outbox = new WorkList();
worker = new Worker(inbox, inProgress, outbox);

inbox.push(new WorkItem());
setTimeout(worker.work, 1000);