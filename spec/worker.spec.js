const {Worker, WorkItem, WorkList, SimpleSkillStrategy, DontWorkOnSameItemStrategy} = require('../src/worker');

const createWorkItem = () => new WorkItem({'ux': 1, 'dev': 1, 'qa': 1});
const createDeveloper = () => new Worker(new DontWorkOnSameItemStrategy(new SimpleSkillStrategy({'all': 1})));
const createColumns = (itemsPerColumn = {}) => {
  const columns = {
    backlog: new WorkList('Backlog'),
    ux: new WorkList('ux'),
    devQueue: new WorkList('-'),
    dev: new WorkList('dev'),
  };
  columns.ordered = () => [ columns.backlog, columns.ux, columns.devQueue, columns.dev ];

  Object.keys(itemsPerColumn)
      .forEach(columnName => itemsPerColumn[columnName]
          .forEach(item => columns[columnName].add(item)));

  return columns;
};
const startWorkingOn = (item, columnName, developer, columns) => {
  const column = columns[columnName];
  const columnList = columns.ordered();
  const columnIndex = columnList.indexOf(column);

  developer.startWorkingOn({
    inbox: columnList[columnIndex - 1],
    inProgress: column,
    outbox: columnList[columnIndex + 1],
    item: item
  });
};

describe('a specialist', () => {
  const item = new WorkItem({'dev': 1});

  it('can work on its skill', () => {
    const developer = new Worker(new SimpleSkillStrategy({'dev': 1}));
    expect(developer.canWorkOn({ skill: 'dev', item })).toBeTruthy();
    expect(developer.canWorkOn({ skill: 'dev', item })).toBe(1);
  });
  it('can not work on another skill', () => {
    const developer = new Worker(new SimpleSkillStrategy({'dev': 1}));
    expect(developer.canWorkOn({ skill: 'qa', item })).toBeFalsy();
  })
  it('has a name', () => {
    const developer = new Worker(new SimpleSkillStrategy({'dev': 1}));
    expect(developer.name()).toMatch('dev')
  })
});

describe('a generalist', () => {
  const item = new WorkItem({'ux': 1, 'dev': 1, 'qa': 1});

  it('can work on any skill', () => {
    const developer = new Worker(new SimpleSkillStrategy({'all': 1}));
    expect(developer.canWorkOn({ skill: 'ux', item })).toBe(1);
  });
  it('can work on any skill', () => {
    const developer = new Worker(new SimpleSkillStrategy({'rest': 1}));
    expect(developer.canWorkOn({ skill: 'ux', item })).toBe(1);
  });
  it('can can have a specialisation', () => {
    const developer = new Worker(new SimpleSkillStrategy({'qa': 1, 'rest': 0.5}));
    expect(developer.canWorkOn({ skill: 'qa', item })).toBe(1);
    expect(developer.canWorkOn({ skill: 'ux', item })).toBe(0.5);
  });
});

describe('a generalist with a dont-work-on-same-item strategy', () => {
  const item1 = createWorkItem();
  const item2 = createWorkItem();

  let developer;

  describe('who has not worked on item 1', () => {
    beforeEach(() => {
      developer = createDeveloper();
    });

    it('can work item 1 in any skill', () => {
      expect(developer.canWorkOn({ skill: 'ux', item: item1 })).toBe(1);
      expect(developer.canWorkOn({ skill: 'dev', item: item1 })).toBe(1);
      expect(developer.canWorkOn({ skill: 'qa', item: item1 })).toBe(1);
    });
  });

  describe('who has worked on item 1 in ux', () => {
    beforeEach(jest.useFakeTimers);
    afterEach(jest.runAllTimers);

    beforeEach(() => {
      const columns = createColumns({ backlog: [item1], dev: [item2] });

      developer = createDeveloper();
      startWorkingOn(item1, 'ux', developer, columns);

      jest.advanceTimersByTime(1000);
    });

    it('cannot work on the same item in dev', () => {
      expect(developer.canWorkOn({ skill: 'dev', item: item1 })).toBe(0);
    });

    it('can work on item 2 in dev', () => {
      expect(developer.canWorkOn({ skill: 'dev', item: item2 })).toBe(1);
    });
  });
});

describe('two generalists with a dont-work-on-same-item strategy', () => {
  const item1 = new WorkItem({'ux': 1, 'dev': 1, 'qa': 1});

  const createDeveloper = () => new Worker(new DontWorkOnSameItemStrategy(new SimpleSkillStrategy({'all': 1})));

  let developer1;
  let developer2;

  describe('when developer 1 has worked on an item in ux', () => {
    beforeEach(jest.useFakeTimers);
    afterEach(jest.runAllTimers);

    beforeEach(() => {
      const columns = createColumns({ backlog: [item1] });

      developer1 = createDeveloper();
      developer2 = createDeveloper();

      startWorkingOn(item1, 'ux', developer1, columns);

      jest.advanceTimersByTime(1000);
    });

    it('developer 2 can work on the same item in dev', () => {
      expect(developer2.canWorkOn({ skill: 'dev', item: item1 })).toBe(1);
    });
  });
});
