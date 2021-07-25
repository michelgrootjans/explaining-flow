const {Worker} = require('../src/worker');

describe('a specialist', () => {
  it('can work on its skill', () => {
    const developer = new Worker({'dev': 1});
    expect(developer.canWorkOn('dev')).toBeTruthy();
    expect(developer.canWorkOn('dev')).toBe(1);
  });
  it('can not work on another skill', () => {
    const developer = new Worker({'dev': 1});
    expect(developer.canWorkOn('qa')).toBeFalsy();
  })
  it('has a name', () => {
    const developer = new Worker({'dev': 1});
    expect(developer.name()).toMatch('dev')
  })
});

describe('a generalist', () => {
  it('can work on any skill', () => {
    const developer = new Worker({'all': 1});
    expect(developer.canWorkOn('ux')).toBe(1);
  });
  it('can work on any skill', () => {
    const developer = new Worker({'rest': 1});
    expect(developer.canWorkOn('ux')).toBe(1);
  });
  it('can can have a specialisation', () => {
    const developer = new Worker({'qa': 1, 'rest': 0.5});
    expect(developer.canWorkOn('qa')).toBe(1);
    expect(developer.canWorkOn('ux')).toBe(0.5);
  });
});
