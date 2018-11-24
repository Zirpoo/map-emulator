class Isomorph {

    /**
     * A config object of the canvas created
     * 
     * @constructor
     * @param {Object} options 
     */
    constructor (options) {
        this.options = options;
        this.defaultStyle = (options && options.defaultStyle);
        this.callbackStyles = [];
        this.cells = [];
        this.grid = {
            origin: [0, 0],
            width: 0,
            height: 0,
            cell: {
                height: 0,
                width: 0
            }
        };
        
        if (options && options.canvas) {
            this.canvas = options.canvas;

            try {
                if (typeof this.canvas === 'string') {
                    this.canvas = document.getElementById(this.canvas);
                }
                if (!this.canvas.getAttribute('width')) {
                    this.canvas.width = window.innerWidth;
                }
                if (!this.canvas.getAttribute('height')) {
                    this.canvas.height = window.innerHeight;
                }
                if (this.options.origin instanceof Array && this.options.origin.length) {
                    this.grid.origin = this.options.origin;
                }
                if (!this.options.scale) {
                    this.options.scale = 1;
                }
                this.canvas.ctx = this.canvas.getContext('2d');
                this.canvas.ctx.scale(this.options.scale, this.options.scale);
                this.canvas.ctx.translate(this.grid.origin[0], this.grid.origin[1]);
                this.canvas.ctx.fillStyle = this.defaultStyle.backgroundColor || "";
                this.canvas.ctx.strokeStyle = this.defaultStyle.border || "";
                this.canvas.ctx.font = this.defaultStyle.font || "15px Calibri";
                this.canvas.ctx.lineWidth = 1;
                
                if (this.canvas.ctx.fillStyle.length > 1) {
                    this.callbackStyles.push('fill');
                }
                if (this.canvas.ctx.strokeStyle.length > 1) {
                    this.callbackStyles.push('stroke');
                }
            } catch (error) {
                this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                console.error('An error occured while initializing the canvas');
            }
        } else {
            console.error('Canvas not found');
        }
    }

    /**
     * Calculate the perimeter of a cell and check if the pointer is into it
     * 
     * @param {MouseEvent} event
     * @returns {Object} A cell object
     */
    onCell (event) {
        let mx = Math.floor(event.clientX * this.options.scale);
        let my = Math.floor(event.clientY * this.options.scale);
        let cellHalfWidth = Math.floor(this.grid.cell.width / 2);
        let cellHalfHeight = Math.floor(this.grid.cell.height / 2);
        
        return this.cells.find(cell => {
            let originX = cell.x + cellHalfWidth + this.grid.origin[0];
            let originY = cell.y + cellHalfHeight + this.grid.origin[1];
            let mouseOrigin = {
                x: Math.abs(mx - originX),
                y: Math.abs(my - originY)
            };
            if (
                mouseOrigin.x < cellHalfWidth && 
                mouseOrigin.y < cellHalfHeight && 
                (mouseOrigin.x + mouseOrigin.y) <= (cellHalfWidth + cellHalfHeight) / 2
            ) {
                return true;
            }
            return false;
        });
    }

    /**
     * Set an event on every cells
     * 
     * @param {String} eventName 
     * @param {Function} callback 
     */
    addGlobalCellsEvent (eventName, callback) {
        for (let i = 0; i < this.cells.length; i++) {
            if (!this.cells[i].events[eventName]) {
                this.cells[i].events[eventName] = [];
            }
            this.cells[i].events[eventName].push(callback);
        }
    }

    /**
     * Draw a new cell on the canvas
     * 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} width 
     * @param {Number} height 
     * @param {Object} existingCell 
     */
    addCell (id, x, y, width, height, existingCell) {
        // Diamond cell
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(x + width * 0.5, y);
        this.canvas.ctx.lineTo(x, y + height * 0.5);
        this.canvas.ctx.lineTo(x + width * 0.5, y + height);
        this.canvas.ctx.lineTo(x + width, y + height * 0.5);
        this.canvas.ctx.lineTo(x + width * 0.5, y);
        
        if (!existingCell) {
            this.cells.push({
                id,
                x,
                y,
                events: {},
                neighbors: this.getAdjacentCells(id),
                grid: this.getCellInfo(id)
            });
        }
        for (let i = 0; i < this.callbackStyles.length; i++) {
            this.canvas.ctx[this.callbackStyles[i]]();
        }
    }
    
    /**
     * Update a cell in canvas
     * 
     * @param {Object} cell 
     */
    update (cell) {
        let existingCell = this.cells.find(el => el.id == cell.id);
        this.addCell(cell.id, cell.x, cell.y, this.grid.cell.width, this.grid.cell.height, existingCell);

        if (existingCell.text) {
            let text = existingCell.id;

            if (existingCell.text.hasOwnProperty('value')) {
                text = existingCell.text.value;
            }
            this.addText(text, existingCell.text.x, existingCell.text.y);
        }
    }

    /**
     * Draw text on a cell
     * 
     * @param {any} text
     * @param {Number} x
     * @param {Number} y
     */
    addText (text, x, y) {
        if (this.defaultStyle && this.defaultStyle.color) {
            this.canvas.ctx.fillStyle = this.defaultStyle.color;
        } else {
            this.canvas.ctx.fillStyle = "#333333";
        }
        this.canvas.ctx.fillText(text, x, y);
        let cell = this.cells.find(cell => cell.id == text);

        if (cell && !cell.text) {
            cell.text = {x, y};
        }
        if (this.defaultStyle && this.defaultStyle.backgroundColor) {
            this.canvas.ctx.fillStyle = this.defaultStyle.backgroundColor;
        }
    }

    /**
     * A custom isometric map for my project
     * 
     * @param {Number} rows
     * @param {Number} cols
     */
    customGrid (rows, cols) {
        let cellWidth = Math.floor(window.innerWidth / (rows + 0.5));
        let cellHeight = Math.floor((window.innerHeight) / (cols + 0.5));
        let fontSize = parseInt(this.canvas.ctx.font);
        this.grid.rows = rows;
        this.grid.cols = cols;
        this.grid.cell.width = cellWidth;
        this.grid.cell.height = cellHeight;

        let j = 0;
        for (let i = 0; i < rows; i++) {
            let id = i + (j * (rows * 2));
            let x = cellWidth * i;
            let y = cellHeight * (j + 1);
            let textX = (cellWidth/2 - ((fontSize/4) * id.toString().length)) + x;
            let textY = y + ((cellHeight/3) + (fontSize-2));

            this.addCell(id, x, y, cellWidth, cellHeight);
            this.addText(id, textX, textY, 0, 0);
            if (i + 1 == rows && j < cols - 1) {
                i = -1;
                j++;
            }
        }
        j = 0;
        for (let i = 0; i < rows; i++) {
            let id = i + (j * rows) + ((j + 1) * rows);
            let x = (cellWidth * (i + 1)) - cellWidth / 2;
            let y = (cellHeight * (j + 2)) - cellHeight / 2;
            let textX = (cellWidth/2 - ((fontSize/4) * id.toString().length)) + x;
            let textY = y + ((cellHeight/3) + (fontSize-2));

            this.addCell(id, x, y, cellWidth, cellHeight);
            this.addText(id, textX, textY, 0, 0);
            if (i + 1 == rows && j < cols - 1) {
                i = -1;
                j++;
            }
        }

        this.cells = this.cells.sort((a, b) => a.id - b.id);
        this.canvas.addEventListener('click', event => this.eventHandler(event));
        this.canvas.addEventListener('mousemove', event => this.eventHandler(event));
    }

    /**
     * execute every functions of the cell when the pointer is on it
     * 
     * @param {Event} event 
     */
    eventHandler (event) {
        let cell = this.onCell(event);

        if (cell && cell.events[event.type] && cell.events[event.type].length > 0) {
            for (let callback of cell.events[event.type]) {
                callback.call(this, cell);
            }
        }
    }

    /**
     * Attach a context to each cells from the object cellsContext
     * 
     * @param {Array<Object>} cellsContext
     */
    updateCellsContext (cellsContext) {
        // Key s and l=[3,11,75,83] doesn't show any pattern purposes other than graphics
        // Key l=[7,71] are black cells in fights
        // Key l=195 are pnjs cell location that can be here (Including pnj's not visible yet)
        // Key c is a cell to move to another map
        let lastFillStyle = this.canvas.ctx.fillStyle;
        
        for (let i = 0; i < cellsContext.length; i++) {
            if (!Object.keys(cellsContext[i]).length || [2, 66, 64].includes(cellsContext[i].l)) {
                this.canvas.ctx.fillStyle = this.defaultStyle.cell.disabled;
                this.cells[i].canWalk = false;
                this.update(this.cells[i]);
            } else {
                this.cells[i].canWalk = true;
            }
            if (cellsContext[i].hasOwnProperty('c')) {
                this.canvas.ctx.fillStyle = this.defaultStyle.cell.eventTrigger.mapChange;
                if (!this.cells[i].events.click) {
                    this.cells[i].events.click = [];
                }
                this.cells[i].events.click.push(function (cell) {
                    console.warn("Map change doesn't work yet");
                });
                this.update(this.cells[i]);
            }
        }
        this.canvas.ctx.fillStyle = lastFillStyle;
    }
    
    /**
     * Get isometric x and y values from the id
     * 
     * @param {Number} cellId 
     */
    getCellInfo (cellId) {
        let x = cellId % this.grid.rows;
        let y = Math.ceil((cellId - (x - 1)) / 28);
        let odd = ((cellId - (x - 14)) / (y * 2)) == 14 ? 1 : 0;
        return {x, y, odd};
    }
    
    /**
     * Search for every adjacent cells around
     * 
     * @param {Number} cellId 
     */
    getAdjacentCells (cellId) {
        let originPos = this.getCellInfo(cellId);
        let moves = [
            [[14, -15], [-14, 13]], // [x, -x], [y, -y] Peer movements
            [[15, -14], [-13, 14]] // Odd movements
        ];
        let move = moves[originPos.odd];
        let adjacentCells = [null, null, null, null];

        if (
            (originPos.y < this.grid.cols || originPos.odd == 0) && 
            (originPos.x < this.grid.rows || originPos.odd == 0)
        ) {
            adjacentCells[0] = cellId + move[0][0];
        }
        if (
            (originPos.y > 1 || originPos.odd == 1) && 
            (originPos.x >= 1 || originPos.odd == 1)
        ) {
            adjacentCells[1] = cellId + move[0][1];
        }
        if (
            (
                originPos.y > 1 || (originPos.odd == 1 && 
                originPos.y < this.grid.cols)
            ) && 
            (originPos.x < this.grid.rows || originPos.odd == 0)
        ) {
            adjacentCells[2] = cellId + move[1][0];
        }
        if (
            (
                originPos.x > 1 || (originPos.odd == 1 && 
                originPos.y < this.grid.cols)
            ) &&
            originPos.y < this.grid.cols
        ) {
            adjacentCells[3] = cellId + move[1][1];
        }
        return adjacentCells;
    }
}
