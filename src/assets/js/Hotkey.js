
function Hotkey(shortcut, callback) {
    if (typeof shortcut === "undefined") {
        throw new Error("Shortcut was not sent");
        return;
    } else {
        shortcut = shortcut.toLowerCase();
    }

    if (typeof callback !== "function") {
        throw new Error("Callback should be a function");
        return;
    }

    this.pressingKeys = new Array();

    this.ctrlKey = false;
    this.shiftKey = false;
    this.altKey = false;
    this.keys = new Array();
    this.callback = callback;

    while(shortcut.indexOf(" ") > 0) {
        shortcut = shortcut.replace(" ", "");
    }

    shortcut.split("+").forEach((key, index) => {
        if (key == "ctrl") {
            this.ctrlKey = true;

        } else if (key == "alt") {
            this.altKey = true;

        } else if (key == "shift") {
            this.shiftKey = true;

        } else {
            key = key.toUpperCase();

            this.keys.push(key);
        }
    });

    document.addEventListener("keydown", () => {
        this.check(event)
    });
    document.addEventListener("keyup", () => {
        this.keyUp();
    });
}

Hotkey.prototype.destroy = function() {
    this.callback = () => {};
}

Hotkey.prototype.toString = function() {
    var hotkey = "";

    this.getShortcutKeys().forEach((key, index) => {
        if (index > 0) {
            hotkey += " + ";
        }
        hotkey += key;
    });

    return hotkey;
}

Hotkey.prototype.getShortcutKeys = function() {
    var keys = new Array();
    if (this.ctrlKey) {
        keys.push("ctrl");
    }
    if (this.altKey) {
        keys.push("alt");
    }
    if (this.shiftKey) {
        keys.push("shift");
    }

    this.keys.sort();
    this.keys.forEach((key, index) => {
        keys.push(key);
    });

    return keys;
}

Hotkey.prototype.keyUp = function() {
    this.pressingKeys = new Array();
}

Hotkey.prototype.check = function(e) {
    var dntKeys = new Array(16, 17, 18);

    if (dntKeys.indexOf(e.keyCode) == -1 && this.pressingKeys.indexOf(e.key.toUpperCase()) == -1) {
        this.pressingKeys.push(e.key.toUpperCase());
    }

    if (this.ctrlKey == e.ctrlKey && this.altKey == e.altKey && this.shiftKey == e.shiftKey) {

        if (this.pressingKeys.sort().toString() == this.keys.sort().toString()) {
            this.pressingKeys = new Array();
            this.callback();
        }
    }
}
