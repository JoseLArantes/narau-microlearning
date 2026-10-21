export interface CandidateFeatures {
  title: string;
  summary: string;
  categories: string[];
}

export interface CandidateScoringInput extends CandidateFeatures {
  hasImage?: boolean;
}

export interface PersonalityEligibilityInput extends CandidateFeatures {
  citationCount?: number;
}

/**
 * Personality pages are accepted only when they have several references and
 * their Wikipedia categories explicitly overlap the area's research focus.
 * Three references keeps broad categories such as Science and History from
 * filling the pool with lightly documented biographies.
 */
export const MIN_PERSONALITY_CITATIONS = 3;

const DEFINITIONAL_PATTERN =
  /^((the|a|an)\s+)?[^.!?]{0,80}\b(is|are|was|were|refers to|describes|means|denotes|designates)\b/i;

const LIST_OF_PATTERN = /^list of\b/i;

const PERSONALITY_CATEGORY_PATTERN =
  /\b(?:people|persons|personas|pessoas|living people|living persons|personas vivas|pessoas vivas|births|deaths|nacimientos|fallecimientos|nascimentos|mortes|scientists?|physicists?|chemists?|mathematicians?|astronomers?|engineers?|artists?|painters?|sculptors?|architects?|writers?|authors?|poets?|actors?|actresses?|directors?|musicians?|singers?|politicians?|journalists?|historians?|philosophers?|inventors?|explorers?|athletes?|monarchs?|royalty|nobility|professors?|educators?|lawyers?|doctors?|cientistas?|fisicos?|físicos?|matemáticos?|astronomos?|astrônomos?|engenheiros?|artistas?|pintores?|escultores?|arquitetos?|escritores?|autores?|poetas?|atores?|atrizes?|diretores?|musicos?|músicos?|cantores?|politicos?|políticos?|jornalistas?|historiadores?|filosofos?|filósofos?|inventores?|exploradores?|atletas?)\b/i;

const CATEGORY_NAMESPACE_PATTERN = /^(?:category|categoría|categoria|catégorie|kategorie|categorie|kategoria|категория|категорія):/i;

const CATEGORY_NOISE = new Set(["and", "de", "dos", "from", "in", "of", "the", "to", "with"]);

function isDefinitional(summary: string): boolean {
  return DEFINITIONAL_PATTERN.test(summary);
}

function categoryTokens(value: string): string[] {
  return value
    .replace(CATEGORY_NAMESPACE_PATTERN, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !CATEGORY_NOISE.has(token) && !/^\d+$/.test(token));
}

function categoryTokenMatches(focusToken: string, candidateToken: string): boolean {
  if (focusToken === candidateToken) return true;
  const shortestLength = Math.min(focusToken.length, candidateToken.length);
  let sharedPrefix = 0;
  while (sharedPrefix < shortestLength && focusToken[sharedPrefix] === candidateToken[sharedPrefix]) {
    sharedPrefix += 1;
  }
  return sharedPrefix >= Math.min(5, focusToken.length, candidateToken.length);
}

function isRelevantToResearchCategory(categories: string[], researchCategory: string): boolean {
  const focusTokens = categoryTokens(researchCategory);
  if (focusTokens.length === 0) return false;

  return categories.some((category) => {
    const candidateTokens = categoryTokens(category);
    return focusTokens.some((focusToken) =>
      candidateTokens.some((candidateToken) => categoryTokenMatches(focusToken, candidateToken)),
    );
  });
}

export function isPersonalityLike(input: CandidateFeatures): boolean {
  return input.categories.some((category) => PERSONALITY_CATEGORY_PATTERN.test(category));
}

export function isPersonalityEligible(
  input: PersonalityEligibilityInput,
  researchCategory: string | undefined,
): boolean {
  if (!isPersonalityLike(input)) return true;
  if ((input.citationCount ?? 0) < MIN_PERSONALITY_CITATIONS) return false;
  return researchCategory ? isRelevantToResearchCategory(input.categories, researchCategory) : false;
}

export function isDisambiguationLike(input: CandidateFeatures): boolean {
  return (
    /\(disambiguation\)/i.test(input.title) ||
    /\(disambiguation\)/i.test(input.summary) ||
    input.categories.some((category) => category.toLowerCase().includes("disambiguation"))
  );
}

export function isListLike(input: CandidateFeatures): boolean {
  return (
    LIST_OF_PATTERN.test(input.title) ||
    /\(list\)$/i.test(input.title) ||
    /^may refer to/i.test(input.summary) ||
    input.categories.some((category) => category.toLowerCase().includes(":lists"))
  );
}

export function isStubLike(summary: string): boolean {
  return summary.length < 200;
}

/**
 * Scores a Wikipedia candidate following the ingestion rules:
 * +40 for a 200-8000 char summary, +20 for an image, +10 for a definitional
 * first sentence, +10 for categories, -50 for disambiguation-like pages,
 * -50 for list-like pages, -30 for stub-like pages. Clamped to 0..100.
 */
export function scoreCandidate(input: CandidateScoringInput): number {
  let score = 0;
  const summaryLength = input.summary.length;

  if (summaryLength >= 200 && summaryLength <= 8000) score += 40;
  if (input.hasImage === true) score += 20;
  if (isDefinitional(input.summary)) score += 10;
  if (input.categories.length > 0) score += 10;
  if (isDisambiguationLike(input)) score -= 50;
  if (isListLike(input)) score -= 50;
  if (isStubLike(input.summary)) score -= 30;

  return Math.max(0, Math.min(100, score));
}
