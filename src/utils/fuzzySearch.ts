/**
 * Fuzzy Search Engine for Carteles Click 3D
 * Multi-domain search across Materials, Technical Dictionary, and Blog Posts.
 */

export interface FuzzySearchResult<T = any> {
  id: string;
  type: "material" | "dictionary" | "blog";
  title: string;
  subtitle: string;
  badge: string;
  badgeColor?: "primary" | "accent" | "subtle" | "emerald" | "blue";
  slug?: string;
  targetView: "cotizador" | "materiales" | "diccionario" | "blog";
  targetParam?: string;
  score: number;
  highlightIndices?: [number, number][];
  rawItem: T;
}

/**
 * Normalizes text for robust matching (removes accents, lowercase, trimmed)
 */
export function normalizeString(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Calculates a fuzzy match score between target text and query
 * Higher score = better match. 0 = no match.
 */
export function fuzzyMatch(
  target: string,
  query: string
): { matches: boolean; score: number } {
  const normTarget = normalizeString(target);
  const normQuery = normalizeString(query);

  if (!normQuery) return { matches: true, score: 1 };
  if (!normTarget) return { matches: false, score: 0 };

  // Exact match
  if (normTarget === normQuery) {
    return { matches: true, score: 100 };
  }

  // Starts with
  if (normTarget.startsWith(normQuery)) {
    return { matches: true, score: 90 };
  }

  // Word prefix match
  const words = normTarget.split(/[\s\-_/.,]+/);
  for (const word of words) {
    if (word.startsWith(normQuery)) {
      return { matches: true, score: 85 };
    }
  }

  // Substring match
  const subIdx = normTarget.indexOf(normQuery);
  if (subIdx !== -1) {
    const penalty = Math.min(20, subIdx * 2);
    return { matches: true, score: 80 - penalty };
  }

  // Sequential character match (fuzzy subsequence)
  let tIdx = 0;
  let qIdx = 0;
  let matchedChars = 0;
  let consecutiveMatches = 0;
  let maxConsecutive = 0;

  while (tIdx < normTarget.length && qIdx < normQuery.length) {
    if (normTarget[tIdx] === normQuery[qIdx]) {
      matchedChars++;
      consecutiveMatches++;
      if (consecutiveMatches > maxConsecutive) {
        maxConsecutive = consecutiveMatches;
      }
      qIdx++;
    } else {
      consecutiveMatches = 0;
    }
    tIdx++;
  }

  if (qIdx === normQuery.length) {
    // All characters of query found in order
    const ratio = normQuery.length / normTarget.length;
    const score = 40 + maxConsecutive * 5 + ratio * 20;
    return { matches: true, score: Math.min(75, Math.round(score)) };
  }

  // Token-based matching (every query word must match somewhere)
  const queryTokens = normQuery.split(/\s+/).filter(Boolean);
  if (queryTokens.length > 1) {
    const allTokensMatch = queryTokens.every((token) =>
      normTarget.includes(token)
    );
    if (allTokensMatch) {
      return { matches: true, score: 65 };
    }
  }

  return { matches: false, score: 0 };
}

/**
 * Searches across Materials, Dictionary terms, and Blog posts
 */
export function searchGlobalCatalog(
  query: string,
  materials: any[],
  dictionaryTerms: any[],
  blogPosts: any[],
  limit = 12
): FuzzySearchResult[] {
  if (!query || !query.trim()) return [];

  const results: FuzzySearchResult[] = [];

  // 1. Search Materials
  for (const mat of materials) {
    const titleScore = fuzzyMatch(mat.name || "", query);
    const descScore = fuzzyMatch(mat.shortDesc || mat.description || "", query);
    const catScore = fuzzyMatch(mat.category || "", query);
    const usesScore = mat.recommendedUses
      ? Math.max(...mat.recommendedUses.map((u: string) => fuzzyMatch(u, query).score), 0)
      : 0;

    const maxScore = Math.max(
      titleScore.score * 1.2,
      descScore.score * 0.8,
      catScore.score * 0.9,
      usesScore * 0.7
    );

    if (maxScore >= 30) {
      const categoryLabels: Record<string, string> = {
        lonas: "Lona Impresa",
        vinilos: "Vinilo Ploteo",
        rigidos: "Sustrato Rígido",
        portabanners: "Estructura Banner",
      };

      results.push({
        id: `mat-${mat.id}`,
        type: "material",
        title: mat.name,
        subtitle: mat.shortDesc || mat.description?.slice(0, 85) + "...",
        badge: categoryLabels[mat.category] || "Material",
        badgeColor: "primary",
        targetView: "cotizador",
        targetParam: mat.id,
        score: maxScore,
        rawItem: mat,
      });
    }
  }

  // 2. Search Dictionary Terms
  for (const term of dictionaryTerms) {
    const titleScore = fuzzyMatch(term.term || "", query);
    const shortDefScore = fuzzyMatch(term.shortDefinition || "", query);
    const fullDefScore = fuzzyMatch(term.fullDefinition || "", query);

    const maxScore = Math.max(
      titleScore.score * 1.3,
      shortDefScore.score * 0.9,
      fullDefScore.score * 0.6
    );

    if (maxScore >= 30) {
      results.push({
        id: `dict-${term.slug || term.term}`,
        type: "dictionary",
        title: term.term,
        subtitle: term.shortDefinition?.slice(0, 95) + "...",
        badge: "Glosario Técnico",
        badgeColor: "accent",
        slug: term.slug,
        targetView: "diccionario",
        targetParam: term.slug,
        score: maxScore,
        rawItem: term,
      });
    }
  }

  // 3. Search Blog Posts
  for (const post of blogPosts) {
    const titleScore = fuzzyMatch(post.title || "", query);
    const excerptScore = fuzzyMatch(post.excerpt || "", query);
    const tagScore = fuzzyMatch(post.tag || "", query);

    const maxScore = Math.max(
      titleScore.score * 1.2,
      excerptScore.score * 0.85,
      tagScore.score * 0.9
    );

    if (maxScore >= 30) {
      results.push({
        id: `blog-${post.id || post.slug}`,
        type: "blog",
        title: post.title,
        subtitle: post.excerpt?.slice(0, 95) + "...",
        badge: post.tag || "Guía Taller",
        badgeColor: "emerald",
        slug: post.slug,
        targetView: "blog",
        targetParam: post.slug,
        score: maxScore,
        rawItem: post,
      });
    }
  }

  // Sort descending by score
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit);
}
