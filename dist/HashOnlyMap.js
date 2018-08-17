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
    class HashOnlyMap {
        constructor(keyHash, entries, defaultValue) {
            this._map = new Map();
            this.keyHash = keyHash;
            this.defaultValue = defaultValue;
            if (entries) {
                for (const [key, value] of entries) {
                    this.set(key, value);
                }
            }
        }
        get size() {
            return this._map.size;
        }
        set(key, value) {
            const pair = [key, value];
            const keyIsPrimitive = utils_1.isPrimitive(key);
            if (this.keyHash || keyIsPrimitive) {
                this._map.set(keyIsPrimitive ? key : this.keyHash(key), pair);
            }
            else {
                this._map.set(key, pair[1]);
            }
            return this;
        }
        get(key, defaultValue = this.defaultValue) {
            const value = this.getValue(key);
            return typeof value !== "undefined" ? value : defaultValue;
        }
        has(key) {
            const value = this.getValue(key);
            return value !== undefined;
        }
        'delete'(key) {
            return this._map.delete(!this.keyHash || utils_1.isPrimitive(key)
                ? key
                : this.keyHash(key));
        }
        clear() {
            return this._map.clear();
        }
        *entries(useDefault = false, defaultValue = this.defaultValue) {
            for (const [key, value] of this._map.entries()) {
                let pair;
                if (utils_1.isPrimitive(key)) {
                    pair = [...value];
                }
                else {
                    pair = [key, value];
                }
                if (useDefault && pair[1] === undefined) {
                    pair[1] = defaultValue;
                }
                yield pair;
            }
        }
        forEach(callback, thisArg) {
            const hasThis = typeof thisArg !== "undefined";
            for (const [key, value] of this.entries()) {
                if (hasThis) {
                    callback.call(thisArg, key, value, this);
                }
                else {
                    callback(key, value, this);
                }
            }
        }
        *keys() {
            for (const [key] of this.entries()) {
                yield key;
            }
        }
        *values(useDefault = false, defaultValue = this.defaultValue) {
            for (const [, value] of this.entries(useDefault, defaultValue)) {
                yield value;
            }
        }
        getValue(key) {
            const keyIsPrimitive = utils_1.isPrimitive(key);
            const valueIsPair = this.keyHash || keyIsPrimitive;
            const value = valueIsPair
                ? this._map.get(keyIsPrimitive ? key : this.keyHash(key))
                : this._map.get(key);
            return value !== undefined && valueIsPair ? value[1] : value;
        }
    }
    exports.HashOnlyMap = HashOnlyMap;
    HashOnlyMap.prototype[Symbol.iterator] = HashOnlyMap.prototype.entries;
});
//# sourceMappingURL=HashOnlyMap.js.map