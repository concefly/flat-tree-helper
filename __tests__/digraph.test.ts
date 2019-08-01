import { findAllTrace, IDigraphNode } from '../src/digraph';

describe('findAllTrace', () => {
  const simplify = (result: IDigraphNode[][]) => result.map(r => r.map(_r => _r.id).join(','));

  it('normal', () => {
    const g: IDigraphNode[] = [
      {
        id: '0',
        nextIds: ['1', '2'],
      },
      {
        id: '1',
        nextIds: ['2', '3', '4'],
      },
      {
        id: '2',
        nextIds: ['4'],
      },
      {
        id: '3',
        nextIds: ['4', '5'],
      },
      {
        id: '4',
        nextIds: ['5'],
      },
      {
        id: '5',
        nextIds: [],
      },
    ];
    const result = findAllTrace(g, '0', '5');
    expect(simplify(result)).toEqual(['0,1,2,4,5', '0,1,3,4,5', '0,1,3,5', '0,1,4,5', '0,2,4,5']);
  });

  it('有环', () => {
    const result = findAllTrace(
      [
        { id: '0', nextIds: ['1'] },
        { id: '1', nextIds: ['2'] },
        { id: '2', nextIds: ['1', '3'] },
        { id: '3', nextIds: ['1', '4'] },
        { id: '4', nextIds: [] },
      ],
      '0',
      '4'
    );

    expect(simplify(result)).toEqual(['0,1,2,3,4']);
  });

  it('1e6 节点不爆栈', () => {
    const g: IDigraphNode[] = [];
    const MAX_CNT = 1e6;

    const l2Ids = Array(MAX_CNT)
      .fill(0)
      .map((_, i) => i + '');

    // L1 节点
    g.push({
      id: 'start',
      nextIds: l2Ids,
    });

    // L2 节点
    l2Ids.forEach(id => {
      g.push({ id, nextIds: ['stop'] });
    });

    // L3 节点
    g.push({ id: 'stop', nextIds: [] });

    const result = findAllTrace(g, 'start', 'stop');
    expect(result).toHaveLength(MAX_CNT);
  });
});
