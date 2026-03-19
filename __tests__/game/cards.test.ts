import { ALL_CARD_IDS, FREE_CARD_LIMIT, DIE_MAP, cardImagePath } from '@/lib/game/cards'

describe('ALL_CARD_IDS', () => {
  it('contains exactly 75 IDs from 26 to 100', () => {
    expect(ALL_CARD_IDS).toHaveLength(75)
    expect(ALL_CARD_IDS[0]).toBe(26)
    expect(ALL_CARD_IDS[74]).toBe(100)
  })
})

describe('FREE_CARD_LIMIT', () => {
  it('is 15', () => {
    expect(FREE_CARD_LIMIT).toBe(15)
  })
})

describe('DIE_MAP', () => {
  it('has entries for dice 1 through 6', () => {
    for (let d = 1; d <= 6; d++) {
      expect(DIE_MAP[d as 1|2|3|4|5|6]).toBeDefined()
    }
  })

  it('only die 6 (Dare) has timed=false', () => {
    expect(DIE_MAP[6].timed).toBe(false)
    for (let d = 1; d <= 5; d++) {
      expect(DIE_MAP[d as 1|2|3|4|5].timed).toBe(true)
    }
  })
})

describe('cardImagePath', () => {
  it('returns correct path for a given card ID', () => {
    expect(cardImagePath(26)).toBe('/cards/26.png')
    expect(cardImagePath(100)).toBe('/cards/100.png')
  })
})
