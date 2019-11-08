/**
 * Standard 52-card deck
 */

export const SUITS = 'SDCH';
export const SUIT_PLAY_NAMES = ['♠', '♦', '♣', '♥'];
export const SUIT_FULL_NAMES = ['spades', 'diamonds', 'clubs', 'hearts'];
export const SUIT_HTML_CODES = ['&spades;', '&diams;', '&clubs;', '&hearts;']; // Special Symbol Character Codes for HTML

export const RANKS = 'A23456789TJQK';
export const RANK_PLAY_NAMES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
export const RANK_FULL_NAMES = [
  'Ace',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Jack',
  'Queen',
  'King'
];

export const SUIT_NUM = SUITS.length;
export const RANK_NUM = RANKS.length;

// Standard 52-card deck
export const CARD_NUM = SUIT_NUM * RANK_NUM;

// Card index is defined as: suit + rank * SUIT_NUM
export function index(s: number, r: number): number {
  return s + r * SUIT_NUM;
}

export function rank(index: number): number {
  return Math.floor(index / SUIT_NUM);
}

export function suit(index: number): number {
  return index % SUIT_NUM;
}

// Card names:
export function nameOf(index: number): string {
  return RANKS[rank(index)] + SUITS[suit(index)];
}

export function playNameOf(index: number): string {
  return RANK_PLAY_NAMES[rank(index)] + SUIT_PLAY_NAMES[suit(index)];
}

export function fullNameOf(index: number): string {
  return RANK_FULL_NAMES[rank(index)] + ' of ' + SUIT_FULL_NAMES[suit(index)];
}

// Suit names:
export function suitNameOf(index: number): string {
  return SUITS[suit(index)];
}

export function suitPlayNameOf(index: number): string {
  return SUIT_PLAY_NAMES[suit(index)];
}

export function suitFullNameOf(index: number) {
  return SUIT_FULL_NAMES[suit(index)];
}

export function suitHTMLCodeOf(index: number) {
  return SUIT_HTML_CODES[suit(index)];
}

// Rank names:
export function rankNameOf(index: number) {
  return RANKS[rank(index)];
}

export function rankPlayNameOf(index: number) {
  return RANK_PLAY_NAMES[rank(index)];
}

export function rankFullNameOf(index: number) {
  return RANK_FULL_NAMES[rank(index)];
}

// A set of optionally shuffled playing cards.
export function deck(seed?: number): number[] {
  const cards: number[] = [];
  if (seed == undefined) {
    for (let i = 0; i < CARD_NUM; i++) {
      cards[i] = i;
    }
  } else {
    // use LCG algorithm to pick up cards from the deck
    // http://en.wikipedia.org/wiki/Linear_congruential_generator
    const m = 0x80000000;
    const a = 1103515245;
    const c = 12345;

    for (let i = 0; i < CARD_NUM; i++) {
      seed = (a * seed + c) % m;

      let card = seed % CARD_NUM;
      while (cards.indexOf(card) >= 0) {
        card = (card + 1) % CARD_NUM;
      }
      cards.push(card);
    }
  }
  return cards;
}
