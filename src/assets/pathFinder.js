class PathFinder {

    /**
     * @constructor
     * @param {Isomorph} isomorph 
     */
    constructor (isomorph) {
        this.isomorph = isomorph;
    }
    
    /**
     * 
     * @param {Number} start 
     * @param {Number} end 
     */
    run (start, end) {
        let cells = this.isomorph.cells.slice();
        let closeCells = [];
        let current = cells[start];
        let endCell = cells[end];


        current.score = 0;
        current.h = this.heuristics(current, endCell);
        closeCells.push(current);

        let s = 1;
        while (current) {
            for (let neighborId of current.neighbors) {
                if (cells[neighborId].canWalk) {
                    let neighbor = cells[neighborId];

                    if (!closeCells.find(cell => cell.id == neighbor.id)) {
                        neighbor.previous = current;
                        neighbor.score = current.score + 1;
                        neighbor.h = this.heuristics(neighbor, endCell);
                        closeCells.push(neighbor);
                        current = neighbor;
                        this.isomorph.canvas.ctx.fillStyle = "grey";
                        this.isomorph.update(current);
                    }
                }
            }
            if (s == 20) {
                break;
            }
            s++;
        }
        console.log(
            this.findPath(cells, start),
            closeCells
        );
    }

    findPath (cells, start) {
        let current = cells[start];
        let path = [];

        while (current) {
            let bestCell = current;
            path.push(bestCell);

            for (let neighborId of current.neighbors) {
                let neighbor = cells[neighborId];

                if (neighbor.h && neighbor.h <= bestCell.h) {
                    bestCell = neighbor;
                }
            }
            if (bestCell.id == current.id) {
                console.log('No better path found!');
                break;
            }
            current = bestCell;
        }
        return path;
    }

    heuristics (current, endCell) {
        let indice = current.grid.odd != endCell.grid.odd;
        let noIsoXMove = Math.abs(current.grid.x - endCell.grid.x) + indice;

        return noIsoXMove + ((Math.abs(current.grid.y - endCell.grid.y) - (noIsoXMove - indice % 2)) * 2);
    }
}
