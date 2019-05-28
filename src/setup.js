require('./animation').initialize();
const {Worker, WorkItem, WorkList} = require('./worker');

let backlog = new WorkList('backlog');
let dev = new WorkList('development');
let readyForReview = new WorkList('ready for review');
let review = new WorkList('review');
let readyForQA = new WorkList('ready for QA');
let qa = new WorkList('QA');
let prod = new WorkList('done');

backlog.add(new WorkItem(1000));
backlog.add(new WorkItem(1000));
backlog.add(new WorkItem(1000));
backlog.add(new WorkItem(1000));
backlog.add(new WorkItem(1000));
backlog.add(new WorkItem(1000));
backlog.add(new WorkItem(1000));

setTimeout(() => {
  new Worker(backlog, dev, readyForReview).work();
  new Worker(readyForReview, review, readyForQA).work();
  new Worker(readyForQA, qa, prod).work();
}, 1000);
