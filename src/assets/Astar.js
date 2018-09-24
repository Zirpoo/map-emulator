class Astar {

    /**
     * @constructor
     * @param {Array<Object>} list 
     */
    constructor (list) {
        this.openSet = list;
        this.closeSet = [];

        // Adding Astar structure to each opened sets
        this.openSet.forEach(el => {
            el.f = 0;
            el.g = 0;
            el.h = 0;
        });
    }
}
