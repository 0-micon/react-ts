import { Desk, Filter } from './freecell-desk';
import { toSource, toDestination } from './freecell-basis';

export function solve(
  desk: Desk,
  callback: (moves: number[], destination: number) => void,
  cardFilter: Filter,
  lastCard: number,
  destinationFilter: Filter
): void {
  const moves: number[] = [];
  const done = new Set<string>();
  done.add(desk.toKey());

  let srcMoves: number[][] = [[]];
  let dstMoves: number[][] = [];
  while (srcMoves.length > 0) {
    for (let i = 0, sl = srcMoves.length; i < sl; i++) {
      const path = srcMoves[i];
      desk.moveForward(path);

      moves.length = 0;
      desk.getBestMoves(moves, cardFilter);

      for (let j = 0, ml = moves.length; j < ml; j++) {
        const mov = moves[j];
        const src = toSource(mov);
        const dst = toDestination(mov);

        desk.moveCard(src, dst);

        // Check if we had it already.
        const key = desk.toKey();
        if (!done.has(key)) {
          const next = path.slice();
          next.push(mov);

          if (destinationFilter[dst] && lastCard === desk.cardAt(dst, -1) && callback(next, dst)) {
            // Restore the desk and return.
            desk.moveBackward(next);
            return;
          }

          dstMoves.push(next);
          done.add(key);
        }

        desk.moveCard(dst, src);
      }
      desk.moveBackward(path);
    }
    // Swap source and destination:
    const tmp = srcMoves;
    srcMoves = dstMoves;
    dstMoves = tmp;
    dstMoves.length = 0;
  }
}
