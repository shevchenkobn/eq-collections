(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./HashOnlyMap", "./HashOnlySet", "./HashSet", "./HashMap", "./utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const HashOnlyMap_1 = require("./HashOnlyMap");
    exports.HashOnlyMap = HashOnlyMap_1.HashOnlyMap;
    const HashOnlySet_1 = require("./HashOnlySet");
    exports.HashOnlySet = HashOnlySet_1.HashOnlySet;
    const HashSet_1 = require("./HashSet");
    exports.HashSet = HashSet_1.HashSet;
    const HashMap_1 = require("./HashMap");
    exports.HashMap = HashMap_1.HashMap;
    const utils_1 = require("./utils");
    exports.isPrimitive = utils_1.isPrimitive;
});
//# sourceMappingURL=index.js.map