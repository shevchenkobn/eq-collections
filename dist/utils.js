(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function isPrimitive(value) {
        const type = typeof value;
        return (type !== 'object' && type !== 'function') || value === null;
    }
    exports.isPrimitive = isPrimitive;
});
//# sourceMappingURL=utils.js.map