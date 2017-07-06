function Dropable(element, action) {
    this.element = element;
    this.action = action;

    this.element.addEventListener("dragover", this.dragover, false);
    this.element.addEventListener("drop", this.drop, false);
    this.element.addEventListener("dragleave", this.dragleave, false);
}

Dropable.prototype.dragover = function(event) {
    event.stopPropagation();
    event.preventDefault();

    if (this.className.indexOf("dragging") == -1) {
        this.className += " dragging";
        console.log("dragover");
    }

};

Dropable.prototype.drop = function(event) {
    event.stopPropagation();
    event.preventDefault();

    if (this.className.indexOf("drop") == -1) {
        this.className = this.className.replace("dragging", "drop");
    }

    var files = event.dataTransfer.files[0];

    if (typeof this.action === "function") {
        this.action();

    } else {
        console.log(files);
    }

};

Dropable.prototype.dragleave = function(event) {
    event.stopPropagation();
    event.preventDefault();

    this.className = this.className.replace(" dragging", "");
    console.log("dragend");
};

var d = new Dropable(document.body, () => {
    swal("drop");
});
