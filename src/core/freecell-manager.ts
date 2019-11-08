import { Subject } from 'rxjs';

import { Desk, createCardFilter, createPileFilter } from './freecell-desk';
import { toMove, PILE_START, PILE_END } from './freecell-basis';
import { solve } from './freecell-solver';

/**
 * Card move description.
 */
export interface Move {
  /** Source pile index. */
  source: number;
  /** Destination pile index. */
  destination: number;
  /** Card index. */
  card: number;
}

/**
 * Search result description.
 */
export interface Result {
  count: number;
  /** Destination pile index. */
  destination: number;
  path?: number[];
}

export class FreecellManager {
  private readonly _desk = new Desk();
  private readonly _back = new Desk();

  readonly moves: number[] = [];

  readonly deal$ = new Subject<number[]>();
  readonly move$ = new Subject<Move>();

  getMoves(): void {
    this.moves.length = 0;
    this._desk.getMoves(this.moves);
  }

  isMoveValid(source: number, destination: number): boolean {
    return this.moves.indexOf(toMove(source, destination)) >= 0;
  }

  deal(seed: number): void {
    const cards = this._desk.deal(seed);
    this.getMoves();
    this.deal$.next(cards);
  }

  moveCard(source: number, destination: number): void {
    this._desk.moveCard(source, destination);
    this.getMoves();
    this.move$.next({ source, destination, card: this._desk.cardAt(destination, -1) });
  }

  toResult(destination: number): Result {
    return { count: destination >= 0 ? 1 : 0, destination: destination };
  }

  getTableauDestination(srcIndex: number): number {
    let destination = -1;
    let num = 0;
    for (let i = PILE_START; i < PILE_END; i++) {
      const cardNum = this._desk.numberOfCardsAt(i);
      if (cardNum != 0 && this._desk.canFormTableau(i, srcIndex)) {
        if (cardNum > num) {
          num = cardNum;
          destination = i;
        }
      }
    }
    return destination;
  }

  getCellCardDestination(srcIndex: number): Result {
    let destination = this.getTableauDestination(srcIndex);
    if (destination < 0) {
      destination = this._desk.getEmptyPile();
    }
    return this.toResult(destination);
  }

  getBaseCardDestination(srcIndex: number): Result {
    let destination = this.getTableauDestination(srcIndex);
    if (destination < 0) {
      destination = this._desk.getEmptyCell();
    }
    if (destination < 0) {
      destination = this._desk.getEmptyPile();
    }

    return this.toResult(destination);
  }

  getPileCardDestination(srcIndex: number): Result {
    let destination = this.getTableauDestination(srcIndex);
    if (destination < 0) {
      destination = this._desk.getEmptyCell();
    }
    if (destination < 0) {
      destination = this._desk.getEmptyPile();
    }

    return this.toResult(destination);
  }

  getPath(tableau: number[], from: number, to: number): Result {
    const result: Result = { count: 0, destination: -1 };

    const lastCard = this._desk.cardAt(from, -1);
    const isDestinationEmpty = this._desk.numberOfCardsAt(to) === 0;

    const cardFilter = createCardFilter(tableau);
    const destinationFilter = createPileFilter((index: number) =>
      isDestinationEmpty ? this._desk.numberOfCardsAt(index) == 0 : index == to
    );

    const callback = (path: number[], dst: number) => {
      const count = this._back.countEqualsBackward(dst, tableau);
      if (count === tableau.length) {
        result.count = count;
        result.path = path;
        result.destination = dst;
        return true;
      }
      return false;
    };
    this._back.from(this._desk);
    solve(this._back, callback, cardFilter, lastCard, destinationFilter);
    return result;
  }
}
