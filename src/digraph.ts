export interface IDigraphNode {
  id: string;
  nextIds: string[];
}

/** 两点之间所有路径 */
export const findAllTrace = <G extends IDigraphNode>(
  graph: G[],
  startId: string,
  stopId: string,
  tap?: (g: G) => void
) => {
  const idMap = new Map<string, G>();
  graph.forEach(g => idMap.set(g.id, g));

  const traceSet = new Set<G[]>();

  const _walk = (_id: string, _trace: G[]) => {
    const current = idMap.get(_id);
    if (!current) return;

    if (_trace.find(t => t.id === current.id)) return;

    tap && tap(current);

    if (current.id === stopId) {
      traceSet.add([..._trace, current]);
      return;
    }

    current.nextIds.forEach(nextId => {
      _walk(nextId, [..._trace, current]);
    });
  };

  _walk(startId, []);

  return [...traceSet.values()];
};
