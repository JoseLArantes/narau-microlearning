import { describe, expect, it } from "vitest";
import { chooseDailyCard, type DailyCardOption, type SelectedLearningNode } from "./learning-selection";

const selections: SelectedLearningNode[] = [
  { nodeId: "ai", rootAreaId: "engineering" },
  { nodeId: "databases", rootAreaId: "engineering" },
  { nodeId: "history", rootAreaId: "history" },
];

const cards: DailyCardOption[] = [
  { nodeId: "ai", rootAreaId: "engineering", subjectId: "subject-ai", dailyAreaSubjectId: "daily-ai" },
  { nodeId: "databases", rootAreaId: "engineering", subjectId: "subject-db", dailyAreaSubjectId: "daily-db" },
  { nodeId: "history", rootAreaId: "history", subjectId: "subject-history", dailyAreaSubjectId: "daily-history" },
];

describe("chooseDailyCard", () => {
  it("chooses the exact selection picked by the random source", () => {
    expect(chooseDailyCard({ selections, cards, learnedSubjectIds: new Set(), random: () => 0 })).toEqual(cards[0]);
    expect(chooseDailyCard({ selections, cards, learnedSubjectIds: new Set(), random: () => 0.99 })).toEqual(cards[2]);
  });

  it("falls back to another selected node in the same root before another area", () => {
    const available = cards.filter((card) => card.nodeId !== "ai");
    expect(chooseDailyCard({ selections, cards: available, learnedSubjectIds: new Set(), random: () => 0 })).toEqual(
      cards[1],
    );
  });

  it("never broadens to an unselected parent and excludes learned cards", () => {
    expect(
      chooseDailyCard({
        selections: [{ nodeId: "ai", rootAreaId: "engineering" }],
        cards: [{ nodeId: "engineering", rootAreaId: "engineering", subjectId: "broad", dailyAreaSubjectId: "daily-broad" }],
        learnedSubjectIds: new Set(),
        random: () => 0,
      }),
    ).toBeNull();

    expect(
      chooseDailyCard({
        selections,
        cards,
        learnedSubjectIds: new Set(["subject-ai", "subject-db", "subject-history"]),
        random: () => 0,
      }),
    ).toBeNull();
  });
});
