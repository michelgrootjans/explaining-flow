const {average} = require('./generator');

module.exports = [
  {
    id: 10,
    title: 'a single developer',
    workers: ['dev'],
    stories: {
      amount: 50,
      work: {'dev': 1}
    }
  },
  {
    id: 20,
    title: 'variable work',
    workers: ['dev'],
    stories: {
      amount: 50,
      work: {'dev': 1},
      distribution: average
    }
  },
  {
    id: 30,
    title: 'handover to qa',
    workers: ['dev', 'qa'],
    stories: {
      amount: 50,
      work: {'dev': 1, 'qa': 1},
      distribution: average
    }
  },
  {
    id: 40,
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
    id: 50,
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
    id: 60,
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
    id: 70,
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
    id: 80,
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
    id: 90,
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
    id: 100,
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
    id: 110,
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