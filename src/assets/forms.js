class Form {

    constructor () {}

    /**
     * @param {Number} id 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} size 
     */
    Square (id, x, y, size) {
        this.name = "Square";
        this.id = id;
        this.width = this.height = size;
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * @param {Number} id 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} width 
     * @param {Number} height 
     */
    Rectangle (id, x, y, width, height) {
        this.name = "Rectangle";
        this.id = id;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        return this;
    }
}
