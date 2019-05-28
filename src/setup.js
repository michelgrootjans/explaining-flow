require('./animation').initialize();
const NormalDistribution =require('normal-distribution');
const {Worker, WorkItem, WorkList, Backlog, DoneList} = require('./worker');

let backlog = new Backlog();
let dev = new WorkList('development');
let readyForReview = new WorkList('-');
let review = new WorkList('review');
let readyForQA = new WorkList('-');
let qa = new WorkList('QA');
let prod = new DoneList();

function generateTaskDuration(duration) {
  return Math.floor((Math.random() * duration) + 1);;
}

for (let i = 0; i < 100; i++) {
  backlog.add(new WorkItem(generateTaskDuration(new NormalDistribution(1000, 1))));
}

setTimeout(() => {
  new Worker(backlog, dev, readyForReview).work();
  new Worker(readyForReview, review, readyForQA).work();
  new Worker(readyForQA, qa, prod).work();
}, 1000);
