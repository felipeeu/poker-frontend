type RankCategory =
  | 'high-card'
  | 'one-pair'
  | 'two-pair'
  | 'three-of-a-kind'
  | 'straight'
  | 'flush'
  | 'full-house'
  | 'four-of-a-kind'
  | 'straight-flush'

type ParsedCard = {
  rank: number
  suit: string
}

const rankValues: Record<string, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  T: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
}

const categoryByScore: RankCategory[] = [
  'high-card',
  'one-pair',
  'two-pair',
  'three-of-a-kind',
  'straight',
  'flush',
  'full-house',
  'four-of-a-kind',
  'straight-flush',
]

const parseCard = (card: string): ParsedCard | null => {
  const value = String(card || '').trim().toUpperCase()
  if (value.length !== 2) return null
  const rank = rankValues[value[0]]
  const suit = value[1]
  if (!rank || !['S', 'H', 'D', 'C'].includes(suit)) return null
  return { rank, suit }
}

const straightHigh = (ranks: number[]) => {
  const distinct = [...new Set(ranks)].sort((a, b) => a - b)
  if (distinct.length !== 5) return null
  if (distinct.join(',') === '2,3,4,5,14') return 5
  return distinct[4] === distinct[0] + 4 ? distinct[4] : null
}

const compareScores = (left: number[], right: number[]) => {
  const max = Math.max(left.length, right.length)
  for (let index = 0; index < max; index += 1) {
    const a = left[index] ?? -1
    const b = right[index] ?? -1
    if (a > b) return 1
    if (a < b) return -1
  }
  return 0
}

const evaluateFive = (cards: ParsedCard[]) => {
  const ranks = cards.map((card) => card.rank)
  const suits = cards.map((card) => card.suit)
  const frequencies = new Map<number, number>()
  for (const rank of ranks) frequencies.set(rank, (frequencies.get(rank) ?? 0) + 1)
  const groups = [...frequencies.entries()]
    .map(([rank, count]) => [count, rank] as const)
    .sort((a, b) => (a[0] === b[0] ? b[1] - a[1] : b[0] - a[0]))
  const isFlush = new Set(suits).size === 1
  const straight = straightHigh(ranks)

  const score = (() => {
    if (isFlush && straight) return [8, straight]
    if (groups.map(([count]) => count).join(',') === '4,1') {
      return [7, groups[0][1], groups[1][1]]
    }
    if (groups.map(([count]) => count).join(',') === '3,2') {
      return [6, groups[0][1], groups[1][1]]
    }
    if (isFlush) return [5, ...ranks.sort((a, b) => b - a)]
    if (straight) return [4, straight]
    if (groups[0][0] === 3) {
      const kickers = groups.slice(1).map(([, rank]) => rank).sort((a, b) => b - a)
      return [3, groups[0][1], ...kickers]
    }
    if (groups.map(([count]) => count).join(',') === '2,2,1') {
      const pairs = groups.filter(([count]) => count === 2).map(([, rank]) => rank).sort((a, b) => b - a)
      const kicker = groups.find(([count]) => count === 1)?.[1] ?? 0
      return [2, pairs[0], pairs[1], kicker]
    }
    if (groups[0][0] === 2) {
      const kickers = groups.slice(1).map(([, rank]) => rank).sort((a, b) => b - a)
      return [1, groups[0][1], ...kickers]
    }
    return [0, ...ranks.sort((a, b) => b - a)]
  })()

  return { score, category: categoryByScore[score[0]] }
}

const combinationsOfFive = <T,>(items: T[]) => {
  const combinations: T[][] = []
  for (let a = 0; a < items.length - 4; a += 1) {
    for (let b = a + 1; b < items.length - 3; b += 1) {
      for (let c = b + 1; c < items.length - 2; c += 1) {
        for (let d = c + 1; d < items.length - 1; d += 1) {
          for (let e = d + 1; e < items.length; e += 1) {
            combinations.push([items[a], items[b], items[c], items[d], items[e]])
          }
        }
      }
    }
  }
  return combinations
}

export const evaluateVisibleHandRank = (cards: string[]) => {
  const parsed = cards.map(parseCard)
  if (parsed.some((card) => card == null)) return null
  const valid = parsed.filter((card): card is ParsedCard => card != null)
  if (valid.length < 5 || valid.length > 7) return null

  let best: ReturnType<typeof evaluateFive> | null = null
  for (const combo of combinationsOfFive(valid)) {
    const evaluated = evaluateFive(combo)
    if (!best || compareScores(evaluated.score, best.score) > 0) best = evaluated
  }
  return best?.category ?? null
}
