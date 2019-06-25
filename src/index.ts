import keyBy from 'lodash.keyby';
import groupBy from 'lodash.groupby';

export interface ITreeNode {
  id: string;
  parentId?: string;
}

/** 深度优先遍历所有后代 */
export const walk = <T extends ITreeNode>(
  list: T[],
  startId: string,
  tap: (t: T, opt: { done: () => void }) => void
) => {
  // list 转 map，优化查找速度
  const idMap = keyBy(list, 'id');
  const childrenMap = groupBy(list, 'parentId');

  if (!idMap[startId]) return;

  const _walk = (_id: string) => {
    let shouldStop = false;

    const done = () => {
      shouldStop = true;
    };

    // tap 自己
    idMap[_id] && tap(idMap[_id], { done });

    // 如果用户调用了 done, 则可以停止 walk
    if (shouldStop) return;

    // 递归 tap 儿子
    childrenMap[_id] && childrenMap[_id].forEach(child => _walk(child.id));
  };

  _walk(startId);

  return list;
};

/** 递归删除 */
export const remove = <T extends ITreeNode>(list: T[], startId: string) => {
  const removeSym = Symbol('remove flag');

  // 给后代打删除标记
  walk(list, startId, t => (t[removeSym] = true));

  // 只保留没有删除标记的节点
  return list.filter(t => !t[removeSym]);
};

/** 移动 */
export const move = <T extends ITreeNode>(
  list: T[],
  id: string,
  parentId?: string,
  opt: {
    before?: string;
    after?: string;
  } = {}
) => {
  if (opt.before && opt.after) throw new Error('before 和 after 不可同时设置');

  const newList = [...list];

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
};

/** 查找所有 parent */
export const findAllParent = <T extends ITreeNode>(list: T[], startId: string): T[] => {
  let current = list.find(t => t.id === startId);
  const parentList: T[] = [];

  while (current) {
    parentList.unshift(current);
    current = list.find(t => t.id === current.parentId);
  }

  // 移除自己
  parentList.pop();

  return parentList;
};
