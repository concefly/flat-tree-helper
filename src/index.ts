import keyBy from 'lodash.keyby';
import groupBy from 'lodash.groupby';
import unionBy from 'lodash.unionby';
import memoize from 'fast-memoize';

export interface ITreeNode {
  id: string;
  parentId?: string;
}

export interface Dictionary<V> {
  [index: string]: V;
}

export class FlatTreeHelper<T extends ITreeNode> {
  /** 把 trace 合并成 tree */
  static reduceTraceList<T extends ITreeNode>(traceList: T[][]): T[] {
    return (unionBy.apply as any)(null, [...traceList, (t: T) => t.id]);
  }

  constructor(readonly list: T[]) {}

  /** 懒获取 idMap */
  public getIdMap = memoize(() => keyBy(this.list, 'id') as Dictionary<T>);

  /** 懒获取 childrenMap */
  public getChildrenMap = memoize(() => groupBy(this.list, 'parentId') as Dictionary<T[]>);

  /** 深度优先遍历所有后代 */
  public walk(
    startId: string,
    tap: (
      t: T,
      opt: {
        /** walk 踪迹 */
        trace: T[];
        isLeaf: boolean;
        done: () => void;
      }
    ) => void
  ) {
    // list 转 map，优化查找速度
    const idMap = this.getIdMap();
    const childrenMap = this.getChildrenMap();

    if (!idMap[startId]) return;

    const _walk = (_id: string, _lastTrace: T[] = []) => {
      const currentTreeNode = idMap[_id];
      if (!currentTreeNode) return;

      let shouldStop = false;
      const done = () => {
        shouldStop = true;
      };

      const trace = [..._lastTrace, currentTreeNode];
      const childrenNodes = childrenMap[_id];
      const isLeaf = !childrenNodes || childrenNodes.length === 0;

      // tap 自己
      tap(currentTreeNode, { done, trace, isLeaf });

      // 如果用户调用了 done, 则可以停止 walk
      if (shouldStop) return;

      // 递归 tap 儿子
      !isLeaf && childrenNodes.forEach(child => _walk(child.id, trace));
    };

    _walk(startId);
  }

  /** 递归删除 */
  public remove(startId: string) {
    const removeSet = new Set<string>();

    // 给后代打删除标记
    this.walk(startId, t => removeSet.add(t.id));

    // 只保留没有删除标记的节点
    return this.list.filter(t => !removeSet.has(t.id));
  }

  /** 移动 */
  public move(
    id: string,
    parentId?: string,
    opt: {
      before?: string;
      after?: string;
    } = {}
  ) {
    if (opt.before && opt.after) throw new Error('before 和 after 不可同时设置');

    const newList = [...this.list];

    const targetIndex = newList.findIndex(t => t.id === id);
    if (targetIndex < 0) throw new Error('id 不存在');

    const newTreeNode = {
      ...newList[targetIndex],
      parentId,
    };

    newList[targetIndex] = newTreeNode;

    if (opt.before) {
      newList.splice(targetIndex, 1);

      const beforeIndex = newList.findIndex(t => t.id === opt.before);
      newList.splice(beforeIndex, 0, newTreeNode);

      return newList;
    }

    if (opt.after) {
      newList.splice(targetIndex, 1);

      const afterIndex = newList.findIndex(t => t.id === opt.after);
      newList.splice(afterIndex + 1, 0, newTreeNode);

      return newList;
    }

    return newList;
  }

  /** 查找所有 parent */
  public findAllParent(startId: string): T[] {
    const idMap = this.getIdMap();
    const parentList: T[] = [];

    let current: T | null = idMap[startId];

    while (current) {
      parentList.unshift(current);
      current = current.parentId ? idMap[current.parentId] : null;
    }

    // 移除自己
    parentList.pop();

    return parentList;
  }

  /** 查找所有根节点 */
  public findAllRoot(): T[] {
    return this.list.filter(t => !t.parentId);
  }

  /** 判断是否叶子节点 */
  public isLeaf(id: string): boolean {
    const childrenMap = this.getChildrenMap();

    if (!childrenMap[id]) return true;
    return childrenMap[id].length === 0;
  }

  /** 返回所有踪迹 */
  public getAllTraceList(startId: string): T[][] {
    const re: T[][] = [];

    this.walk(startId, (_, { trace, isLeaf: _isLeaf }) => {
      // 遇到叶子节点，就可以记录下这条 trace 了
      if (_isLeaf) re.push(trace);
    });

    return re;
  }
}
