function Song(element, path, options) {
    this.element = "";
    this.path = "";

    this.title = "";
    this.artist = "";
    this.album = "";
    this.duration = "";
    this.cover = "./assets/img/default.jpg";

    if (typeof element === "undefined") {
        return;
    } else if (typeof element !== "object") {
        throw new Error("element should be an object, " + typeof element + " was given");
        return;
    } else {
        this.element = element;
    }

    if (typeof path === "undefined") {
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
    }
};

Song.prototype.toString = function() {
    return this.path.replace(__dirname, ".");
};

Song.prototype.parse = function() {
    this.path = this.element.getAttribute("data-path");

    var title = this.element.querySelector(".title");
    if (typeof title !== "undefined" && title) {
        this.title = title;
    }

    var artist = this.element.querySelector(".artist");
    if (typeof artist !== "undefined" && artist) {
        this.artist = artist;
    }

    var album = this.element.querySelector(".album");
    if (typeof album !== "undefined" && album) {
        this.album = album;
    }

    var duration = this.element.querySelector(".duration");
    if (typeof duration !== "undefined" && duration) {
        this.duration = duration;
    }

    var cover = this.element.getAttribute("data-cover-path");
    if (typeof cover !== "undefined" && cover) {
        this.cover = cover;
    }
};
