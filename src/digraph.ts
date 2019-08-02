export interface IDigraphNode {
  id: string;
  nextIds: string[];
}

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
