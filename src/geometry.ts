import minBy from 'lodash.minby';
import inRange from 'lodash.inrange';

export type IDirType = 'top' | 'left' | 'right' | 'bottom';

export class Point {
  constructor(readonly x: number, readonly y: number) {}

  getDistance(p: Point) {
    const dx = p.x - this.x;
    const dy = p.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

/** 直线类 */
export class Line {
  static fromPoints(p1: Point, p2: Point) {
    return new Line(p1.x, p1.y, p2.x, p2.y);
  }

  constructor(readonly x1: number, readonly y1: number, readonly x2: number, readonly y2: number) {
    if (x1 === x2 && x1 === y1 && y1 === y2) {
      throw new Error(`坐标错误 (${x1}, ${y1}), (${x2}, ${y2})`);
    }
  }

  readonly a = this.y2 - this.y1;
  readonly b = this.x1 - this.x2;
  readonly c = this.x2 * this.y1 - this.x1 * this.y2;

  isOnLine(p: Point) {
    return Math.abs(this.a * p.x + this.b * p.y + this.c) < Number.MIN_VALUE;
  }

  /** 点到线的距离，可能是负数 */
  getDistance(p: Point) {
    const { a, b, c } = this;
    return (a * p.x + b * p.y + c) / Math.sqrt(a * a + b * b);
  }

  /** 垂足点 */
  getPedalPoint(p: Point): Point {
    const a2b2 = this.a * this.a + this.b * this.b;

    const x = (p.x * this.b * this.b - this.a * this.b * p.y - this.a * this.c) / a2b2;
    const y = (p.y * this.a * this.a - this.a * this.b * p.x - this.b * this.c) / a2b2;

    return new Point(x, y);
  }
}

/** 线段 */
export class LineSegment extends Line {
  isOnLine(p: Point): boolean {
    return (
      super.isOnLine(p) && this.x1 <= p.x && p.x <= this.x2 && this.y1 <= p.y && p.y <= this.y2
    );
  }

  /** 获取延长线 */
  getExtendLine(p: Point): Line | undefined {
    if (this.isOnLine(p)) return;

    const p1 = new Point(this.x1, this.y1);
    const p2 = new Point(this.x2, this.y2);

    // 与更近的点连接
    return p.getDistance(p1) < p.getDistance(p2) ? Line.fromPoints(p, p1) : Line.fromPoints(p, p2);
  }
}

/** 矩形 */
export class Rect {
  static union(list: Rect[]): Rect {
    const [first, ...rest] = list;
    if (rest.length === 0) return first;

    return list.reduce((a, b) => a.union(b), first);
  }

  static intersection(list: Rect[]): Rect | null {
    const [first, ...rest] = list;
    if (rest.length === 0) return first;

    return list.reduce<Rect | null>((a, b) => (a ? a.intersection(b) : null), first);
  }

  constructor(readonly x1: number, readonly y1: number, readonly x2: number, readonly y2: number) {
    if (x1 === x2 && x1 === y1 && y1 === y2) {
      throw new Error(`坐标错误 (${x1}, ${y1}), (${x2}, ${y2})`);
    }
  }

  isInside(t: Point) {
    if (t instanceof Point) {
      return inRange(t.x, this.x1, this.x2) && inRange(t.y, this.y1, this.y2);
    }

    return false;
  }

  size() {
    return (this.x2 - this.x1) * (this.y2 - this.y1);
  }

  /** 求矩形并集 */
  union(t: Rect) {
    const x1 = Math.min(this.x1, t.x1);
    const x2 = Math.max(this.x2, t.x2);
    const y1 = Math.min(this.y1, t.y1);
    const y2 = Math.max(this.y2, t.y2);

    return new Rect(x1, y1, x2, y2);
  }

  /** 求矩形交集 */
  intersection(t: Rect): Rect | null {
    const ur = this.union(t);

    const x1 = this.x1 === ur.x1 ? t.x1 : this.x1;
    const x2 = this.x2 === ur.x2 ? t.x2 : this.x2;
    const y1 = this.y1 === ur.y1 ? t.y1 : this.y1;
    const y2 = this.y2 === ur.y2 ? t.y2 : this.y2;

    if (x1 === x2 || y1 === y2) return null;

    return new Rect(x1, y1, x2, y2);
  }
}

/** 直线集合 */
export class LineSet<L extends Line = Line> {
  constructor(readonly lines: L[]) {}

  filterByDir(p: Point, dir: IDirType) {
    const newLines = this.lines.filter(l => {
      const pp = l.getPedalPoint(p);

      if (dir === 'left') return pp.x < p.x;
      if (dir === 'top') return pp.y < p.y;
      if (dir === 'right') return p.x < pp.x;
      if (dir === 'bottom') return p.y < pp.y;

      return false;
    });

    return new LineSet<L>(newLines);
  }

  filter(tester: (l: L) => boolean) {
    const newLines = this.lines.filter(tester);
    return new LineSet<L>(newLines);
  }

  /** 最近直线 */
  getNearestLine(p: Point): L | undefined {
    const line = minBy(this.lines, l => Math.abs(l.getDistance(p)));
    return line;
  }
}
