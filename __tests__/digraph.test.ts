import { IDigraphNode, Digraph } from '../src/digraph';

const simplify = (result: IDigraphNode[][]) => result.map(r => r.map(_r => _r.id).join(','));

const normalGraph: IDigraphNode[] = [
  { id: '0', nextIds: ['1', '2'] },
  { id: '1', nextIds: ['2', '3', '4'] },
  { id: '2', nextIds: ['4'] },
  { id: '3', nextIds: ['4', '5', '7'] },
  { id: '4', nextIds: ['5', '6'] },
  { id: '5', nextIds: [] },
  { id: '6', nextIds: [] },
  { id: '7', nextIds: [] },
];

const circleGraph: IDigraphNode[] = [
  { id: '0', nextIds: ['1'] },
  { id: '1', nextIds: ['2'] },
  { id: '2', nextIds: ['1', '3'] },
  { id: '3', nextIds: ['1', '4'] },
  { id: '4', nextIds: [] },
];

describe('Digraph', () => {
  describe('getAllTraceList', () => {
    it('normal', () => {
      const result = new Digraph(normalGraph).getAllTraceList('0', '5');
      expect(simplify(result)).toEqual(['0,1,2,4,5', '0,1,3,4,5', '0,1,3,5', '0,1,4,5', '0,2,4,5']);
    });

    it('有环', () => {
      const result = new Digraph(circleGraph).getAllTraceList('0', '4');
      expect(simplify(result)).toEqual(['0,1,2,3,4']);
    });
  });

  describe('getOneTrace', () => {
    it('normal', () => {
      const result = new Digraph(normalGraph).getOneTrace('0', '7')!;
      expect(simplify([result])).toEqual(['0,1,3,7']);
    });

    it('有环', () => {
      const result = new Digraph(circleGraph).getOneTrace('0', '4')!;
      expect(simplify([result])).toEqual(['0,1,2,3,4']);
    });
  });
});
