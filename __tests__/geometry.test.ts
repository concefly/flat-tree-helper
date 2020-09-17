import { Line, Point, LineSet, Rect } from '../src/Geometry';

describe('geometry', () => {
  describe('Line', () => {
    it('getDistance', () => {
      const p = new Point(1, 0);
      const l = new Line(0, 0, 1, 1);
      const d = l.getDistance(p);

      expect(d.toFixed(2)).toEqual((Math.SQRT2 / 2).toFixed(2));
    });

    it('getPedalPoint', () => {
      const p = new Point(1, 0);
      const l = new Line(0, 0, 1, 1);
      const pp = l.getPedalPoint(p);

      expect(pp.x).toEqual(0.5);
      expect(pp.y).toEqual(0.5);
    });
  });

  describe('LineSet', () => {
    it('getNearestLine', () => {
      const l1 = new Line(0, 0, 1, 1);
      const l2 = new Line(0, 1, 1, 1);
      const la = new LineSet([l1, l2]);

      const p = new Point(1, 0);
      const nl = la.getNearestLine(p);

      expect(nl).toEqual(l1);
    });
  });

  describe('Rect', () => {
    it('union', () => {
      const r1 = new Rect(0, 0, 10, 10);
      const r2 = new Rect(5, 5, 15, 15);

      const ru = r1.union(r2);
      expect(ru).toMatchSnapshot();
    });

    it('intersection', () => {
      const r1 = new Rect(0, 0, 10, 10);
      const r2 = new Rect(5, 5, 15, 15);

      const ri = r1.intersection(r2);
      expect(ri).toMatchSnapshot();
    });

    it('intersection - 空', () => {
      const r1 = new Rect(0, 0, 1, 1);
      const r2 = new Rect(1, 1, 2, 2);

      const ri = r1.intersection(r2);
      expect(ri).toMatchSnapshot();
    });
  });
});
