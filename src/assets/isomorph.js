class Isomorph {

    /**
     * A config object of the canvas created
     * 
     * @constructor
     * @param {Object} options 
     */
    constructor (options) {
        this.options = options;
        this.callbackStyles = [];
        this.form = new Form();
        this.forms = [];
        
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
                this.canvas.ctx = this.canvas.getContext('2d');
                this.canvas.ctx.scale(this.options.scale, this.options.scale);
                this.canvas.ctx.translate(
                    this.options.origin[0] || 0.1,
                    this.options.origin[1] || 0.1
                );
                this.canvas.ctx.rotate(45 * (Math.PI/180));
    
                this.canvas.ctx.fillStyle = this.options.defaultStyle.backgroundColor || "";
                this.canvas.ctx.strokeStyle = this.options.defaultStyle.border || "";
                this.canvas.ctx.lineWidth = 1;
                if (this.canvas.ctx.strokeStyle.length > 1) {
                    this.callbackStyles.push('stroke');
                }
            } catch (error) {
                context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                console.error('An error occured while initializing the canvas');
            }
        } else {
            console.error('Canvas not found');
        }
    }

    /**
     * Set an event and execute a callback when the pointer is on a form
     * 
     * @param {String} eventName 
     * @param {Function} callback 
     */
    onFormEvent (eventName, callback) {
        this.canvas.addEventListener(eventName, e => {
            let x = Math.floor(e.clientX / this.options.scale / (2 - this.options.scale));
            let y = Math.floor(e.clientY / this.options.scale / (2 - this.options.scale));
            let pointer = this.rotatePoint(x, y, 0, -35, -90);
            pointer.x -= 50/2;
            let form = this.forms.find(form => this.onForm(pointer, form));

            if (form) {
                callback.call(this, form);
            }
        });
    }

    /**
     * Calculate the perimeter of a form and check if the pointer is into it
     * 
     * @param {MouseEvent} pointer 
     * @param {Form} form 
     * @returns {boolean}
     */
    onForm (pointer, form) {
        if (
            // Isometric left/right X axis
            form.x - form.width / 3 < pointer.x && 
            form.x + form.width / (2 - this.options.scale) > pointer.x && 
            // Isometric left/right Y axis
            form.y - form.height / 2 < pointer.y && 
            form.y + form.height / 2 > pointer.y
        ) {
            return true;
        }
        return false;
    }

    /**
     * Calculate the rotation new coordinates on a given origin
     * 
     * @param {Number} posX 
     * @param {Number} posY 
     * @param {Number} originX 
     * @param {Number} originY 
     * @param {Number} angle 
     * @returns {Object} x and y coordinates after the rotation
     */
    rotatePoint (posX, posY, originX, originY, angle) {
        var radians = (Math.PI / 180) * angle,
            cos = Math.cos(radians),
            sin = Math.sin(radians),
            x = (cos * (originX - posX)) + (sin * (originY - posY)) + posX,
            y = (cos * (originY - posY)) - (sin * (originX - posX)) + posY;

        return {x, y};
    }

    /**
     * Draw a new form on the canvas
     * 
     * @param {Form} form 
     * @param {Form} existingForm 
     */
    add (form, existingForm) {
        switch (form.name) {
            case "Square":
                this.canvas.ctx.fillRect(form.x, form.y, form.width, form.height);

                if (!existingForm) {
                    this.forms.push({
                        name: 'Square',
                        id: form.id,
                        x: form.x,
                        y: form.y,
                        width: form.width,
                        height: form.height
                    });
                }
                break;
        }
        for (let i = 0; i < this.callbackStyles.length; i++) {
            this.canvas.ctx[this.callbackStyles[i]]();
        }
    }
    
    /**
     * Update form in canvas
     * 
     * @param {Form} form 
     */
    update (form) {
        let existingForm = this.forms.find(el => el.id == form.id);
        this.add(form, existingForm);

        if (existingForm.text) {
            this.addText(existingForm.id, existingForm.text.x, existingForm.text.y);
        }
    }

    /**
     * Draw text on a form
     * 
     * @param {any} text 
     * @param {Number} x 
     * @param {Number} y 
     */
    addText (text, x, y) {
        let defaultStyle = isomorph.options && isomorph.options.defaultStyle;
        isomorph.canvas.ctx.font = "22px Calibri";

        if (defaultStyle && defaultStyle.color) {
            isomorph.canvas.ctx.fillStyle = defaultStyle.color;
        } else {
            isomorph.canvas.ctx.fillStyle = "black";
        }
        isomorph.canvas.ctx.fillText(text, x, y);
        let form = isomorph.forms.find(form => form.id == text);

        if (!form.text) {
            form.text = {x, y};
        }
        if (defaultStyle && defaultStyle.backgroundColor) {
            isomorph.canvas.ctx.fillStyle = defaultStyle.backgroundColor;
        }
    }

    /**
     * A custom isometric map for my project
     * 
     * @param {Number} width 
     * @param {Number} height 
     * @param {Number} formWidth 
     * @param {Number} formHeight 
     */
    customGrid (width, height, formWidth, formHeight) {
        if (!formHeight) {
            formHeight = formWidth;
        }
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < height; j++) {
                if (i < width) {
                    let xId = width + ((j * ((height * 2) - 12)) + (i + 1));
                    let evenX = formWidth * ((j + 1) + (i + 1));
                    let evenY = (formWidth * (j + 1)) + (-formWidth * (i + 1));
                    let textX = evenX + formWidth / 3;
                    let textY = evenY + formWidth / 6 + 25;

                    isomorph.add(this.form.Square(xId, evenX, evenY, formWidth));
                    setTimeout(() => isomorph.addText(xId, textX, textY, i, j), (i + 1) * (j + 1));
                }
                if (j < width) {
                    let yId = (i * width) + ((i * ((height - 6))) + (j + 1));
                    let oddX = formWidth * (j + (i + 1));
                    let oddY = (formWidth * i) + (-formWidth * j);
                    let textX = oddX + formWidth / 3;
                    let textY = oddY + formWidth / 6 + 25;

                    isomorph.add(this.form.Square(yId, oddX, oddY, formWidth));
                    setTimeout(() => isomorph.addText(yId, textX, textY, i, j), (i + 1) * (j + 1));
                }
            }
        }
    }
}
