import { rank, RANK_NUM, suit } from './deck';

export const PILE_NUM = 8; // cascades
export const CELL_NUM = 4; // open cells
export const BASE_NUM = 4; // foundation piles
export const DESK_SIZE = PILE_NUM + CELL_NUM + BASE_NUM;

export const PILE_START = 0;
export const PILE_END = PILE_START + PILE_NUM;

export const BASE_START = PILE_END;
export const BASE_END = BASE_START + BASE_NUM;

export const CELL_START = BASE_END;
export const CELL_END = CELL_START + CELL_NUM;

export function isPile(index: number): boolean {
  return index >= PILE_START && index < PILE_END;
}

export function isBase(index: number): boolean {
  return index >= BASE_START && index < BASE_END;
}

export function isCell(index: number): boolean {
  return index >= CELL_START && index < CELL_END;
}

export function isTableau(cardA: number, cardB: number): boolean {
  return rank(cardA) == (rank(cardB) + 1) % RANK_NUM && (suit(cardA) & 1) != (suit(cardB) & 1);
}

export function toMove(source: number, destination: number): number {
  return source * DESK_SIZE + destination;
}

export function toDestination(move: number): number {
  return move % DESK_SIZE;
}

export function toSource(move: number): number {
  return (move - (move % DESK_SIZE)) / DESK_SIZE;
}
