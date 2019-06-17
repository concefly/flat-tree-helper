import keyBy from 'lodash.keyby';
import groupBy from 'lodash.groupby';

export interface ITreeNode {
  id: string;
  parentId?: string;
}

/** 深度优先遍历所有后代 */
export const walk = <T extends ITreeNode>(startId: string, tap: (t: T) => void) => (list: T[]) => {
  // list 转 map，优化查找速度
  const idMap = keyBy(list, 'id');
  const childrenMap = groupBy(list, 'parentId');

  if (!idMap[startId]) return;

  const _walk = (_id: string) => {
    // tap 自己
    idMap[_id] && tap(idMap[_id]);

    // 递归 tap 儿子
    childrenMap[_id] && childrenMap[_id].forEach(child => _walk(child.id));
  };

  _walk(startId);

  return list;
};

/** 递归删除 */
export const remove = <T extends ITreeNode>(startId: string) => (list: T[]): T[] => {
  const removeSym = Symbol('remove flag');

  // 给后代打删除标记
  walk(startId, t => (t[removeSym] = true))(list);

  // 只保留没有删除标记的节点
  return list.filter(t => !t[removeSym]);
};

/** 移动 */
export const move = <T extends ITreeNode>(
  id: string,
  parentId?: string,
  opt: {
    before?: string;
    after?: string;
  } = {}
) => (list: T[]): T[] => {
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
