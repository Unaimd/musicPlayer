var Song = function(path, options) {
    this.path = path;

    this.title = "";
    this.artist = "";
    this.album = "";
    this.duration = "";
    this.cover = "./assets/img/default.jpg";
    this.moddate = "";

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
