const SUIT_SYMBOLS: Record<string, string> = {
  S: '♠',
  H: '♥',
  D: '♦',
  C: '♣',
}

const SUIT_CLASSES: Record<string, string> = {
  S: 'card--spades',
  H: 'card--hearts',
  D: 'card--diamonds',
  C: 'card--clubs',
}

const rankLabel = (rank?: string) => {
  if (!rank) return ''
  if (rank === 'T') return '10'
  return rank
}

const parseCard = (value?: string) => {
  if (!value || value.length < 2) return null
  const raw = value.toUpperCase()
  const rank = raw[0]
  const suit = raw[1]
  return {
    rank,
    suit,
    rankText: rankLabel(rank),
    suitSymbol: SUIT_SYMBOLS[suit] || suit,
    suitClass: SUIT_CLASSES[suit] || 'card--unknown',
  }
}

type CardProps = {
  value?: string
  faceDown?: boolean
  label?: string
}

export const Card = ({ value, faceDown, label }: CardProps) => {
  if (faceDown) {
    return (
      <div className="card card--face-down" aria-label={label || 'Face down card'}>
        <div className="card__back" />
      </div>
    )
  }

  const parsed = parseCard(value)
  if (!parsed) {
    return (
      <div className="card card--empty" aria-label={label || 'Empty card'}>
        <span className="card__ghost">?</span>
      </div>
    )
  }

  return (
    <div className={`card ${parsed.suitClass}`} aria-label={label || value}>
      <div className="card__corner">
        <span className="card__rank">{parsed.rankText}</span>
        <span className="card__suit">{parsed.suitSymbol}</span>
      </div>
      <div className="card__center">{parsed.suitSymbol}</div>
      <div className="card__corner card__corner--mirror">
        <span className="card__rank">{parsed.rankText}</span>
        <span className="card__suit">{parsed.suitSymbol}</span>
      </div>
    </div>
  )
}
