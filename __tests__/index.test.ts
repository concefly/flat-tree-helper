import { walk, remove, move, findAllParent, findAllRoot } from '../src';

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

    walk(list, '0', t => {
      tapMap[t.id] = index++;
    });

    expect(tapMap).toStrictEqual({
      '0': 0,
      '1': 1,
      '3': 2,
      '2': 3,
    });
  });

  it('done 参数', () => {
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
    ];

    walk(list, '0', (t, { done }) => {
      tapMap[t.id] = index++;

      if (index === 1) done();
    });

    expect(tapMap).toStrictEqual({
      '0': 0,
    });
  });
});

describe('remove', () => {
  it('normal', () => {
    const result = remove(
      [
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
      ],
      '1'
    );

    expect(result).toStrictEqual([
      {
        id: '0',
      },
    ]);
  });
});

describe('move', () => {
  it('normal', () => {
    const result = move(
      [
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
      ],
      '1-1-1',
      '1'
    );

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
    const result = move(
      [
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
      ],
      '1-1-1',
      '1',
      { before: '1-2' }
    );

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
    const result = move(
      [
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
      ],
      '1-1-1',
      '1',
      { after: '1-1' }
    );

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

describe('findAllParent', () => {
  it('normal', () => {
    const result = findAllParent(
      [
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
      ],
      '1-1-1'
    );

    expect(result).toStrictEqual([
      {
        id: '1',
      },
      {
        id: '1-1',
        parentId: '1',
      },
    ]);
  });
});

describe('findAllRoot', () => {
  it('normal', () => {
    const result = findAllRoot([
      {
        id: '1',
      },
      {
        id: '2',
      },
    ]);

    expect(result).toStrictEqual([
      {
        id: '1',
      },
      {
        id: '2',
      },
    ]);
  });
});
