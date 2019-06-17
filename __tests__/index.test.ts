import { walk, remove, move } from '../src';

describe('walk', () => {
  it('normal', () => {
    let index = 0;
    const tapMap = {};

    const list = [
      {
        id: '0',
      },
      {
        id: '1',
        parentId: '0',
      },
      {
        id: '2',
        parentId: '0',
      },
      {
        id: '3',
        parentId: '1',
      },
    ];

    walk('0', t => {
      tapMap[t.id] = index++;
    })(list);

    expect(tapMap).toStrictEqual({
      '0': 0,
      '1': 1,
      '3': 2,
      '2': 3,
    });
  });
});

describe('remove', () => {
  it('normal', () => {
    const result = remove('1')([
      {
        id: '0',
      },
      {
        id: '1',
        parentId: '0',
      },
      {
        id: '2',
        parentId: '1',
      },
    ]);

    expect(result).toStrictEqual([
      {
        id: '0',
      },
    ]);
  });
});

describe('move', () => {
  it('normal', () => {
    const result = move('1-1-1', '1')([
      {
        id: '1',
      },
      {
        id: '1-1',
        parentId: '1',
      },
      {
        id: '1-1-1',
        parentId: '1-1',
      },
    ]);

    expect(result).toStrictEqual([
      {
        id: '1',
      },
      {
        id: '1-1',
        parentId: '1',
      },
      {
        id: '1-1-1',
        parentId: '1',
      },
    ]);
  });

  it('before', () => {
    const result = move('1-1-1', '1', { before: '1-2' })([
      {
        id: '1',
      },
      {
        id: '1-1',
        parentId: '1',
      },
      {
        id: '1-2',
        parentId: '1',
      },
      {
        id: '1-1-1',
        parentId: '1-1',
      },
    ]);

    expect(result).toStrictEqual([
      {
        id: '1',
      },
      {
        id: '1-1',
        parentId: '1',
      },
      {
        id: '1-1-1',
        parentId: '1',
      },
      {
        id: '1-2',
        parentId: '1',
      },
    ]);
  });

  it('after', () => {
    const result = move('1-1-1', '1', { after: '1-1' })([
      {
        id: '1',
      },
      {
        id: '1-1',
        parentId: '1',
      },
      {
        id: '1-2',
        parentId: '1',
      },
      {
        id: '1-1-1',
        parentId: '1-1',
      },
    ]);

    expect(result).toStrictEqual([
      {
        id: '1',
      },
      {
        id: '1-1',
        parentId: '1',
      },
      {
        id: '1-1-1',
        parentId: '1',
      },
      {
        id: '1-2',
        parentId: '1',
      },
    ]);
  });
});
