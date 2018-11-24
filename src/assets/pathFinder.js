class PathFinder {

    /**
     * @constructor
     * @param {Isomorph} isomorph 
     */
    constructor (isomorph) {
        this.isomorph = isomorph;
        this.cells = isomorph.cells.slice(0);
    }

    getBestPath (cameFrom, current) {
        let path = [current]
        while (cameFrom[current.id]) {
            current = cameFrom[current.id];
            path.push(current);
        }
        return path;
    }

    heuristic (start, goal) {
        return 1;
    }

    getCellDistance(a, b) {
        return Math.sqrt(Math.abs(a.x - b.x) + Math.abs(a.y - b.y));
    }

    getPath(start, goal) {
        let closedSet = [];
        let openSet = [this.cells[start]];
        let cameFrom = [];
        let gScore = [];
        gScore[start] = 0;
        let fScore = [];
        fScore[start] = this.heuristic(start, goal);

        while (openSet.length) {
            let current = openSet.sort((a, b) => fScore[a.id] - fScore[b.id])[0];
            
            if (current.id == goal) {
                return this.getBestPath(cameFrom, current);
            }

            openSet.find((cell, i) => (cell.id == current.id) ? openSet.splice(i, 1) : false);
            closedSet.push(current);
            
            current.neighbors.push(current.id + 1);
            current.neighbors.push(current.id - 1);
            current.neighbors.push(current.id + 28);
            current.neighbors.push(current.id - 28);
            let neighbors = current.neighbors.filter(id => id && id >= 0 && id <= 559 && this.cells[id].canWalk);

            for (let neighbor of neighbors) {
                if (closedSet.find(cell => cell.id == neighbor)) {
                    continue;
                }

                let tentative_gScore = gScore[current.id];
                let nextCell = Math.abs(current.id - neighbor);

                if (nextCell == 1 || nextCell == 28) {
                    tentative_gScore += Math.sqrt(2);
                } else {
                    tentative_gScore += 1;
                }

                if (!openSet.find(cell => cell.id == neighbor)) {
                    openSet.push(this.cells[neighbor]);
                } else if (tentative_gScore >= gScore[neighbor]) {
                    continue; 
                }   

                cameFrom[neighbor] = current;
                gScore[neighbor] = tentative_gScore;
                fScore[neighbor] = gScore[neighbor] + this.heuristic(neighbor, goal);
            }
        }
    }
}
