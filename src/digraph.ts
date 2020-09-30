export interface IDigraphNode {
  id: string;
  nextIds: string[];
}

/** @deprecated */
export const getAllTraceGenerator = <G extends IDigraphNode>(
  graph: G[],
  startId: string,
  stopId: string
) => {
  const idMap = new Map<string, G>();
  graph.forEach(g => idMap.set(g.id, g));

  const _getRestTraceList = function*(_id: string, _trace: G[] = []): IterableIterator<G[]> {
    if (_trace.some(t => t.id === _id)) return;

    const current = idMap.get(_id);
    if (!current) return;

    if (current.id === stopId) {
      yield [current];
    }

    for (const nextId of current.nextIds) {
      const newTrace = [..._trace, current];

      for (const restTrace of _getRestTraceList(nextId, newTrace)) {
        yield [current, ...restTrace];
      }
    }
  };

  return _getRestTraceList(startId);
};

export class Digraph<T extends IDigraphNode> {
  constructor(readonly graph: T[]) {}

  public readonly idMap = new Map<string, T>(this.graph.map(g => [g.id, g]));

  /** 深度优先遍历 */
  public walk(
    startId: string,
    /** 前序遍历 */
    tapVLR: (
      t: T,
      opt: {
        /** walk 踪迹 */
        trace: T[];
        isLeaf: boolean;
        nextList: T[];
        stopWalkIn: () => void;
        exit: () => void;
      }
    ) => void,
    /** 后序遍历 */
    tapLRD?: (
      t: T,
      opt: {
        /** walk 踪迹 */
        trace: T[];
        isLeaf: boolean;
        nextList: T[];
      }
    ) => void
  ) {
    const _walk = (cid: string, lastTrace: T[]) => {
      // 防成环死循环
      if (lastTrace.some(t => t.id === cid)) return;

      const current = this.idMap.get(cid);
      if (!current) return;

      const nextIds = current.nextIds;
      const nextList: T[] = nextIds.map(nid => this.idMap.get(nid)).filter(v => !!v) as any;
      const isLeaf = nextList.length === 0;

      const ns = {
        stopWalkIn: false,
        exit: false,
      };
      const stopWalkIn = () => (ns.stopWalkIn = true);
      const exit = () => (ns.exit = true);

      const trace = lastTrace.concat(current);

      // tap 自己
      tapVLR(current, { stopWalkIn, exit, trace, isLeaf, nextList });

      if (ns.exit) throw new Error('__walk_exit__');

      // 尝试递归 tap 儿子
      if (!ns.stopWalkIn && !isLeaf) nextList.forEach(next => _walk(next.id, trace));

      // 后续遍历
      tapLRD?.(current, { trace, isLeaf, nextList });
    };

    try {
      _walk(startId, []);
    } catch (e) {
      if (e.message === '__walk_exit__') {
        // 调用方主动退出，什么都不干
      } else {
        // 否则继续往上抛
        throw e;
      }
    }
  }

  /** 返回所有踪迹 */
  public getAllTraceList(startId: string, stopId: string): T[][] {
    const re: T[][] = [];

    this.walk(
      startId,
      // 前序
      (cur, { stopWalkIn: done, trace }) => {
        // 遇到停止点 -> 记录并停止
        if (cur.id === stopId) {
          re.push(trace);
          return done();
        }
      }
    );

    return re;
  }

  /** 返回最先找到的一条踪迹 */
  public getOneTrace(startId: string, stopId: string): T[] | undefined {
    let re: T[];
    const blockIds = new Set<string>();

    this.walk(
      startId,
      // 前序
      (cur, { stopWalkIn, exit, trace }) => {
        // block 点 -> 停止当前链路搜索
        if (blockIds.has(cur.id)) return stopWalkIn();

        // 遇到停止点 -> 记录并停止
        if (cur.id === stopId) {
          re = trace;
          return exit();
        }
      },
      // 后序
      cur => {
        // 如果深度优先遍历退出的时候还没有找到 trace，则 block 此节点
        if (!re) blockIds.add(cur.id);
      }
    );

    return re!;
  }
}
