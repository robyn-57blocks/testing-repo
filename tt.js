function Logger(level) {
    if (!(this instanceof Logger)) {
        return new Logger();
    }
    var ERROR = 1;
    var INFO = 2;
    var DEBUG = 3;

    var logLevel = null;

    var levels = {
        debug: 3,
        info: 2,
        error: 1,
        none: 0,
    };

    if (level === undefined) {
        logLevel = ERROR;
    } else {
        logLevel = level;
    }

    this.getLevelName = function (level) {
        for (var name in levels) {
            if (levels[name] == level) {
                return name;
            }
        }
    };

    this.setLevel = function (newLevel) {
        logLevel = newLevel;
        console.log("setting log level to: " + this.getLevelName(newLevel));
    };

    var processMessage = function (msg, level) {
        if (level <= logLevel) {
            console.log(msg);
        }
    };

    this.error = function (msg) {
        processMessage(msg, ERROR);
    };
    this.info = function (msg) {
        processMessage(msg, INFO);
    };
    this.debug = function (msg) {
        processMessage(msg, DEBUG);
    };

    var that = this;
}
