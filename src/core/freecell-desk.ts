import {
  DESK_SIZE,
  PILE_START,
  PILE_END,
  CELL_START,
  CELL_END,
  BASE_START,
  BASE_END,
  isPile,
  toMove,
  isTableau,
  isBase,
  isCell,
  toSource,
  toDestination,
  PILE_NUM
} from './freecell-basis';
import { suit, rank, deck } from './deck';

export interface Filter {
  [key: number]: boolean;
}

export function createCardFilter(cards: number[]): Filter {
  const filter: Filter = {};

  for (let i = 0; i < cards.length; i++) {
    filter[cards[i]] = true;
  }

  return filter;
}

export function createPileFilter(predicate: (index: number) => boolean): Filter {
  const filter: Filter = {};

  for (let i = PILE_START; i < PILE_END; i++) {
    if (predicate(i)) {
      filter[i] = true;
    }
  }

  return filter;
}

/**
 * Freecell Desk
 */
export class Desk {
  private readonly _desk: number[][];

  constructor() {
    this._desk = new Array(DESK_SIZE);
    for (let i = 0; i < DESK_SIZE; i++) {
      this._desk[i] = [];
    }
  }

  get length() {
    return this._desk.length;
  }

  clear() {
    for (let i = 0; i < DESK_SIZE; i++) {
      this._desk[i].length = 0;
    }
  }

  deal(seed: number): number[] {
    this.clear();

    const cards: number[] = deck(seed);
    for (let i = 0; i < cards.length; i++) {
      this._desk[PILE_START + (i % PILE_NUM)].push(cards[i]);
    }

    return cards;
  }

  /**
   *
   * @param line
   * @param index A negative index can be used, indicating an offset from the end of the sequence.
   */
  cardAt(line: number, index: number): number {
    if (index < 0) {
      index = this._desk[line].length + index;
    }
    return this._desk[line][index];
  }

  numberOfCardsAt(line: number): number {
    return this._desk[line].length;
  }

  // Copy other desk into itself.
  from(other: Desk): void {
    this.clear();
    for (let i = 0; i < DESK_SIZE; i++) {
      const line = this._desk[i];
      const count = other.numberOfCardsAt(i);
      for (let j = 0; j < count; j++) {
        line.push(other.cardAt(i, j));
      }
    }
  }

  forEachLocus(callback: (pileIndex: number, cardIndex: number) => boolean) {
    for (let i = 0; i < DESK_SIZE; i++) {
      const line = this._desk[i];
      const length = line.length;
      // Call callback. Break out of the loop if it returns true.
      if (callback(i, length > 0 ? line[length - 1] : -1)) {
        break;
      }
    }
  }

  getEmptyPile(): number {
    for (let i = PILE_START; i < PILE_END; i++) {
      if (this._desk[i].length === 0) {
        return i;
      }
    }
    return -1;
  }

  getEmptyCell(): number {
    for (let i = CELL_START; i < CELL_END; i++) {
      if (this._desk[i].length === 0) {
        return i;
      }
    }
    return -1;
  }

  getBase(card: number): number {
    const s = suit(card);
    const r = rank(card);

    for (let i = BASE_START; i < BASE_END; i++) {
      if (i - BASE_START === s && this._desk[i].length === r) {
        return i;
      }
    }
    return -1;
  }

  getMoves(moves: number[], filter?: (cardIndex: number) => boolean) {
    for (let i = 0; i < DESK_SIZE; i++) {
      const src = this._desk[i];
      if (src.length > 0) {
        const srcCard = src[src.length - 1];

        if (filter && !filter(srcCard)) {
          continue; // Only special cards can be moved.
        }

        const srcSuit = suit(srcCard);
        const srcRank = rank(srcCard);
        for (let j = 0; j < DESK_SIZE; j++) {
          if (i != j) {
            const dst = this._desk[j];
            const dstCard = dst[dst.length - 1];
            if (isPile(j)) {
              if (dst.length == 0) {
                // 1. Can move to an empty space.
                moves.push(toMove(i, j));
              } else {
                // 2. Can move to a tableau. It should be built down in alternating colors.
                if (isTableau(dstCard, srcCard)) {
                  moves.push(toMove(i, j));
                }
              }
            } else if (isBase(j)) {
              if (j - BASE_START == srcSuit && dst.length == srcRank) {
                // 3. Can move to the foundation.
                moves.push(toMove(i, j));
              }
            } else if (isCell(j)) {
              if (dst.length == 0) {
                // 4. Can move to an empty cell.
                moves.push(toMove(i, j));
              }
            }
          }
        }
      }
    }
  }

  getBestMoves(moves: number[], filter: Filter) {
    const emptyCell = this.getEmptyCell();
    const emptyPile = this.getEmptyPile();

    for (let i = 0; i < DESK_SIZE; i++) {
      const src = this._desk[i];
      if (src.length > 0) {
        const card = src[src.length - 1];
        if (filter[card]) {
          // To a tableau.
          for (let j = PILE_START; j < PILE_END; j++) {
            if (j != i) {
              const dst = this._desk[j];
              if (dst.length > 0 && isTableau(dst[dst.length - 1], card)) {
                moves.push(toMove(i, j));
              }
            }
          }

          // To an empty pile.
          if (emptyPile >= 0) {
            if (!isPile(i) || src.length > 1) {
              moves.push(toMove(i, emptyPile));
            }
          }

          // To an empty cell.
          if (emptyCell >= 0) {
            if (!isCell(i)) {
              moves.push(toMove(i, emptyCell));
            }
          }

          // To the base.
          if (!isBase(i)) {
            let base = this.getBase(card);
            if (base >= 0) {
              moves.push(toMove(i, base));
            }
          }
        }
      }
    }
  }

  baseToString(): string {
    let buf = '';
    let prefix = ',';
    for (let i = BASE_START; i < BASE_END; i++) {
      buf += prefix + this._desk[i].length;
      prefix = ',';
    }
    return buf;
  }

  pileToString(): string {
    let arr = [];
    for (let i = PILE_START; i < PILE_END; i++) {
      arr.push(this._desk[i].join(','));
    }
    arr.sort();
    return arr.join(';');
  }

  toKey(): string {
    return this.baseToString() + ':' + this.pileToString();
  }

  moveCard(source: number, destination: number): void {
    this._desk[destination].push(this._desk[source].pop() as number);
  }

  moveForward(moves: number[]): void {
    for (let i = 0, j = moves.length; i < j; i++) {
      this.moveCard(toSource(moves[i]), toDestination(moves[i]));
    }
  }

  moveBackward(moves: number[]): void {
    for (let i = moves.length; i-- > 0; ) {
      this.moveCard(toDestination(moves[i]), toSource(moves[i]));
    }
  }

  canFormTableau(dstIndex: number, srcIndex: number): boolean {
    const dstLine = this._desk[dstIndex];
    const srcLine = this._desk[srcIndex];
    return (
      dstLine.length > 0 &&
      srcLine.length > 0 &&
      isTableau(dstLine[dstLine.length - 1], srcLine[srcLine.length - 1])
    );
  }

  countEqualsBackward(lineIndex: number, cards: number[]): number {
    const line = this._desk[lineIndex];
    const lA = line.length,
      lB = cards.length;
    const lMin = lA < lB ? lA : lB;
    let i = 0;
    while (i < lMin && line[lA - i - 1] == cards[lB - i - 1]) {
      i++;
    }
    return i;
  }
}
