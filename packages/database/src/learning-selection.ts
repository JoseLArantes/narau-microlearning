export interface SelectedLearningNode {
  nodeId: string;
  rootAreaId: string;
}

export interface DailyCardOption {
  nodeId: string;
  rootAreaId: string;
  subjectId: string;
  dailyAreaSubjectId: string;
}

export function chooseDailyCard(input: {
  selections: SelectedLearningNode[];
  cards: DailyCardOption[];
  learnedSubjectIds: Set<string>;
  random?: () => number;
}): DailyCardOption | null {
  const random = input.random ?? Math.random;
  const selections = [...new Map(input.selections.map((selection) => [selection.nodeId, selection])).values()];
  if (selections.length === 0) return null;

  const startIndex = Math.min(selections.length - 1, Math.floor(random() * selections.length));
  const initial = selections[startIndex];
  if (!initial) return null;

  const sameRoot = selections.filter(
    (selection, index) => index !== startIndex && selection.rootAreaId === initial.rootAreaId,
  );
  const otherRoots = selections.filter(
    (selection, index) => index !== startIndex && selection.rootAreaId !== initial.rootAreaId,
  );
  const orderedSelections = [initial, ...shuffle(sameRoot, random), ...shuffle(otherRoots, random)];
  const cardsByNode = new Map(input.cards.map((card) => [card.nodeId, card]));

  for (const selection of orderedSelections) {
    const card = cardsByNode.get(selection.nodeId);
    if (card && !input.learnedSubjectIds.has(card.subjectId)) return card;
  }

  return null;
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    const current = result[index];
    result[index] = result[target] as T;
    result[target] = current as T;
  }
  return result;
}
