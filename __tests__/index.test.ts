import {
  walk,
  remove,
  move,
  findAllParent,
  findAllRoot,
  isLeaf,
  getAllTraceList,
  reduceTraceList,
} from '../src';

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

  it('trace', () => {
    const traceMap = {};

    const t0 = { id: '0' };
    const t0_0 = { id: '0_0', parentId: t0.id };
    const t0_1 = { id: '0_1', parentId: t0.id };
    const t0_0_0 = { id: '0_0_0', parentId: t0_0.id };

    const list = [t0, t0_0, t0_1, t0_0_0];

    walk(list, t0.id, (t, { trace }) => {
      traceMap[t.id] = trace;
    });

    expect(traceMap).toStrictEqual({
      [t0.id]: [t0],
      [t0_0.id]: [t0, t0_0],
      [t0_1.id]: [t0, t0_1],
      [t0_0_0.id]: [t0, t0_0, t0_0_0],
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

describe('isLeaf', () => {
  it('normal', () => {
    const result = isLeaf(
      [
        {
          id: '1',
        },
        {
          id: '2',
          parentId: '1',
        },
      ],
      '2'
    );

    expect(result).toBeTruthy();
  });
});

describe('flatten', () => {
  it('normal', () => {
    const t0 = { id: '0' };
    const t0_0 = { id: '0_0', parentId: t0.id };
    const t0_1 = { id: '0_1', parentId: t0.id };
    const t0_0_0 = { id: '0_0_0', parentId: t0_0.id };

    const list = [t0, t0_0, t0_1, t0_0_0];
    const result = getAllTraceList(list, t0.id);

    expect(result).toStrictEqual([[t0, t0_0, t0_0_0], [t0, t0_1]]);
  });
});

describe('reduceTraceList', () => {
  it('normal', () => {
    const t0 = { id: '0' };
    const t0_0 = { id: '0_0', parentId: t0.id };
    const t0_1 = { id: '0_1', parentId: t0.id };
    const t0_0_0 = { id: '0_0_0', parentId: t0_0.id };

    const traceList = [[t0, t0_0, t0_0_0], [t0, t0_1]];
    const result = reduceTraceList(traceList);

    expect(result.sort((a, b) => a.id.localeCompare(b.id))).toStrictEqual(
      [t0, t0_0, t0_1, t0_0_0].sort((a, b) => a.id.localeCompare(b.id))
    );
  });
});
