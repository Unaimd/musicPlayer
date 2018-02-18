// TODO: change to class
function Song(element, path, options) {
    this.element = "";
    this.path = "";

    this.title = "";
    this.artist = "";
    this.album = "";
    this.duration = "";
    this.cover = "./assets/img/default.jpg";
    this.moddate = "";

    if (typeof element !== "object") {
        throw new Error("element should be an object, " + typeof element + " was given");
        return;
    } else {
        this.element = element;
    }

    if (typeof path === "undefined") {
        // required
        return;

    } else if (typeof path !== "string") {
        throw new Error("path sould be a string, " + typeof path + " was given");
        return;
    } else {
        this.path = path
    }

    if (typeof options === "object") {
        if (typeof options.title !== "undefined" && options.title) {
            this.title = options.title;
        }

        if (typeof options.artist !== "undefined" && options.artist) {
            this.artist = options.artist;
        }

        if (typeof options.album !== "undefined" && options.album) {
            this.album = options.album;
        }

        if (typeof options.duration !== "undefined" && options.duration) {
            this.duration = options.duration;
        }

        if (typeof options.cover !== "undefined" && options.cover) {
            this.cover = options.cover;
        }

        if (typeof options.moddate !== "undefined" && options.moddate) {
            this.moddate = options.moddate;
        }
    }
};

Song.prototype.toString = function() {
    return this.path.replace(__dirname, ".");
};

Song.prototype.parse = function() {
    this.path = this.element.getAttribute("data-path");

    let title = this.element.getElementsByClassName("title")[0];
    if (typeof title !== "undefined" && title) {
        this.title = title;
    }

    let artist = this.element.getElementsByClassName("artist")[0];
    if (typeof artist !== "undefined" && artist) {
        this.artist = artist;
    }

    let album = this.element.getElementsByClassName("album")[0];
    if (typeof album !== "undefined" && album) {
        this.album = album;
    }

    let duration = this.element.getElementsByClassName("duration")[0];
    if (typeof duration !== "undefined" && duration) {
        this.duration = duration;
    }

    let cover = this.element.getAttribute("data-cover-path");
    if (typeof cover !== "undefined" && cover) {
        this.cover = cover;
    }

    let moddate = this.element.getAttribute("data-moddate");
    if (typeof moddate !== "undefined" && moddate) {
        this.moddate = moddate;
    }
};
