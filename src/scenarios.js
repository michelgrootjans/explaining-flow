const {average} = require('./generator');

module.exports = [
  {
    id: 1,
    title: 'a single developer',
    workers: ['dev'],
    stories: {
      amount: 50,
      work: {'dev': 1}
    }
  },
  {
    id: 2,
    title: 'variable work',
    workers: ['dev'],
    stories: {
      amount: 50,
      work: {'dev': 1},
      distribution: average
    }
  },
  {
    id: 3,
    title: 'handover to qa',
    workers: ['dev', 'qa'],
    stories: {
      amount: 50,
      work: {'dev': 1, 'qa': 1},
      distribution: average
    }
  },
  {
    id: 4,
    title: 'ux first',
    workers: ['ux', 'dev', 'qa'],
    stories: {
      amount: 200,
      work: {'ux': 1.5, 'dev': 1.5, 'qa': 1.5},
      distribution: average
    },
    speed: 20
  },
  {
    id: 5,
    title: 'ux: 1, dev: 2, qa: 1.5',
    workers: ['ux', 'dev', 'qa'],
    stories: {
      amount: 200,
      work: {'ux': 1, 'dev': 2, 'qa': 1.5},
      distribution: average
    },
    speed: 20
  },
  {
    id: 6,
    title: '2nd developer',
    workers: ['ux', 'dev', 'dev', 'qa'],
    stories: {
      amount: 200,
      work: {'ux': 1, 'dev': 2, 'qa': 1.5},
      distribution: average
    },
    speed: 20
  },
  {
    id: 7,
    title: 'limit WIP to 10',
    workers: ['ux', 'dev', 'qa'],
    stories: {
      amount: 200,
      work: {'ux': 1, 'dev': 2, 'qa': 1.5},
      distribution: average
    },
    speed: 20,
    wipLimit: 10
  },
  {
    id: 8,
    title: 'limit WIP to 4',
    workers: ['ux', 'dev', 'qa'],
    stories: {
      amount: 200,
      work: {'ux': 1, 'dev': 2, 'qa': 1.5},
      distribution: average
    },
    speed: 20,
    wipLimit: 4
  },
  {
    id: 9,
    title: 'limit WIP to 2',
    workers: ['ux', 'dev', 'qa'],
    stories: {
      amount: 200,
      work: {'ux': 1, 'dev': 2, 'qa': 1.5},
      distribution: average
    },
    speed: 20,
    wipLimit: 2
  },
  {
    id: 10,
    title: 'fullstack team members',
    workers: ['all', 'all', 'all'],
    stories: {
      amount: 200,
      work: {'ux': 1, 'dev': 2, 'qa': 1.5},
      distribution: average
    },
    speed: 20
  },
];