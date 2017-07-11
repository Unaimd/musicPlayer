function Dropable(element, callbacks) {
    this.childrens = 0;

    this.element = element;

    this.dragenter = (event) => {
        this.childrens++;

        if (this.element.className.indexOf(" dragenter") == -1) {
            this.element.className = this.element.className.replace(" drop", "");
            this.element.className = this.element.className.replace(" dragleave", "");
            this.element.className += " dragenter";
        }

        if (typeof callbacks.dragenter === "function") {
            callbacks.dragenter(event);
        }

    };

    this.dragover = (event) => {

        if (typeof callbacks.dragover === "function") {
            callbacks.dragover(event);
        }

    };

    this.drop = (event) => {
        this.childrens = 0;

        if (this.element.className.indexOf(" dragenter") > -1) {
            this.element.className = this.element.className.replace(" dragenter", " drop");
            this.element.className = this.element.className.replace(" drop", "");

        }

        if (typeof callbacks.drop === "function") {
            callbacks.drop(event, event.dataTransfer.files);
        }
    };

    this.dragleave = (event) => {
        this.childrens--;

        if (this.childrens == 0) {

            if (this.element.className.indexOf(" dragenter") > -1) {
                this.element.className = this.element.className.replace(" dragenter", " dragleave");

                setTimeout(() => {
                    this.element.className = this.element.className.replace(" dragleave", "");
                }, 1000);
            }

            if (typeof callbacks.dragleave === "function") {
                callbacks.dragleave(event);
            }
        }
    };

    this.element.addEventListener("dragenter", this.stopAndPreventDefault, false);
    this.element.addEventListener("dragover", this.stopAndPreventDefault, false);
    this.element.addEventListener("drop", this.stopAndPreventDefault, false);
    this.element.addEventListener("dragleave", this.stopAndPreventDefault, false);

    this.element.addEventListener("dragenter", this.dragenter, false);
    this.element.addEventListener("dragover", this.dragover, false);
    this.element.addEventListener("dragleave", this.dragleave, false);
    this.element.addEventListener("drop", this.drop, false);

}

Dropable.prototype.stopAndPreventDefault = function(event) {
    event.stopPropagation();
    event.preventDefault();
}
