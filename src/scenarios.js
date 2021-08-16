const {average} = require('./generator');

module.exports = [
  {
    title: 'a single developer',
    workers: ['dev'],
    stories: {
      amount: 50,
      work: {'dev': 1}
    }
  },
  {
    title: 'variable work',
    workers: ['dev'],
    stories: {
      amount: 50,
      work: {'dev': 1},
      distribution: average
    }
  },
  {
    title: 'handover to qa',
    workers: ['dev', 'qa'],
    stories: {
      amount: 50,
      work: {'dev': 1, 'qa': 1},
      distribution: average
    }
  },
  {
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
    title: '3rd developer',
    workers: ['ux', 'dev', 'dev', 'dev', 'qa'],
    stories: {
      amount: 200,
      work: {'ux': 1, 'dev': 2, 'qa': 1.5},
      distribution: average
    },
    speed: 20
  },
  {
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