const {Worker, WorkItem, SimpleSkillStrategy} = require('../src/worker');

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
