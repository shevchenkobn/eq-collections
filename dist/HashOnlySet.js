(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const utils_1 = require("./utils");
    class HashOnlySet {
        constructor(valueHash, values) {
            this._map = new Map();
            this.valueHash = valueHash;
            if (values) {
                for (const value of values) {
                    this.add(value);
                }
            }
        }
        get size() {
            return this._map.size;
        }
        add(value) {
            if (!this.valueHash || utils_1.isPrimitive(value)) {
                this._map.set(value, value);
            }
            else {
                this._map.set(this.valueHash(value), value);
            }
            return this;
        }
        has(value) {
            return this._map.has(!this.valueHash || utils_1.isPrimitive(value)
                ? value
                : this.valueHash(value));
        }
        'delete'(value) {
            return this._map.delete(!this.valueHash || utils_1.isPrimitive(value)
                ? value
                : this.valueHash(value));
        }
        clear() {
            return this._map.clear();
        }
        values() {
            return this._map.values();
        }
        forEach(callback, thisArg) {
            const hasThis = thisArg !== undefined;
            for (const value of this.values()) {
                if (hasThis) {
                    callback.call(thisArg, value, value, this);
                }
                else {
                    callback(value, value, this);
                }
            }
        }
    }
    exports.HashOnlySet = HashOnlySet;
    HashOnlySet.prototype[Symbol.iterator]
        = HashOnlySet.prototype.entries
            = HashOnlySet.prototype.keys
                = HashOnlySet.prototype.values;
});
//# sourceMappingURL=HashOnlySet.js.map