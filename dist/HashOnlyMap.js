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
            if (!this.keyHash || utils_1.isPrimitive(key)) {
                this._map.set(key, pair);
            }
            else {
                this._map.set(this.keyHash(key), pair);
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
        *entries() {
            for (const [key, value] of this._map.entries()) {
                if (utils_1.isPrimitive(key)) {
                    yield value;
                }
                else {
                    yield [key, value];
                }
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
        *values() {
            for (const [, value] of this.entries()) {
                yield value;
            }
        }
        getValue(key) {
            return !this.keyHash
                ? this._map.get(key)
                : this._map.get(utils_1.isPrimitive(key) ? key : this.keyHash(key))[1];
        }
    }
    exports.HashOnlyMap = HashOnlyMap;
    HashOnlyMap.prototype[Symbol.iterator] = HashOnlyMap.prototype.entries;
});
//# sourceMappingURL=HashOnlyMap.js.map