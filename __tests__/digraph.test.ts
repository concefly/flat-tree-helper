import { IDigraphNode, getAllTraceGenerator } from '../src/digraph';

const simplify = (result: IDigraphNode[][]) => result.map(r => r.map(_r => _r.id).join(','));

describe('getAllTraceGenerator', () => {
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
    const result = getAllTraceGenerator(g, '0', '5');
    expect(simplify([...result])).toEqual([
      '0,1,2,4,5',
      '0,1,3,4,5',
      '0,1,3,5',
      '0,1,4,5',
      '0,2,4,5',
    ]);
  });

  it('有环', () => {
    const result = getAllTraceGenerator(
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

    expect(simplify([...result])).toEqual(['0,1,2,3,4']);
  });
});
