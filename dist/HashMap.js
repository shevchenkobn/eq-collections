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
    class HashMap {
        constructor(keyHash, keysEqual, entries, defaultValue) {
            this._map = new Map();
            this.keyHash = keyHash;
            this.keysEqual = keysEqual;
            this.defaultValue = defaultValue;
            if (entries) {
                for (const [key, value] of entries) {
                    this.set(key, value);
                }
            }
        }
        get size() {
            let size = this._map.size;
            for (const [key, value] of this._map) {
                if (utils_1.isPrimitive(key)) {
                    size += value.size - 1;
                }
            }
            return size;
        }
        set(key, value) {
            const keyIsPrimitive = utils_1.isPrimitive(key);
            if (this.keyHash || keyIsPrimitive) {
                const hash = keyIsPrimitive ? key : this.keyHash(key);
                const values = this._map.get(hash);
                if (!values) {
                    this._map.set(hash, new Map([[key, value]]));
                }
                else {
                    if (!keyIsPrimitive && this.keysEqual) {
                        for (const [mapKey,] of values) {
                            if (this.keysEqual(mapKey, key)) {
                                values.set(mapKey, value);
                                return this;
                            }
                        }
                    }
                    values.set(key, value);
                }
            }
            else {
                this._map.set(key, value);
            }
            return this;
        }
        get(key, defaultValue = this.defaultValue) {
            let value;
            const keyIsPrimitive = utils_1.isPrimitive(key);
            if (this.keyHash || keyIsPrimitive) {
                const hash = keyIsPrimitive ? key : this.keyHash(key);
                const values = this._map.get(hash);
                if (values) {
                    if (!keyIsPrimitive && this.keysEqual) {
                        for (const [mapKey,] of values) {
                            if (this.keysEqual(mapKey, key)) {
                                value = values.get(mapKey);
                            }
                        }
                    }
                    else {
                        value = values.get(key);
                    }
                }
            }
            else {
                value = this._map.get(key);
            }
            return value !== undefined ? value : defaultValue;
        }
        has(key) {
            const keyIsPrimitive = utils_1.isPrimitive(key);
            if (this.keyHash || keyIsPrimitive) {
                const hash = keyIsPrimitive ? key : this.keyHash(key);
                const values = this._map.get(hash);
                if (values) {
                    if (!keyIsPrimitive && this.keysEqual) {
                        for (const [mapKey,] of values) {
                            if (this.keysEqual(mapKey, key)) {
                                return true;
                            }
                        }
                    }
                    else {
                        return values.has(key);
                    }
                }
                return false;
            }
            else {
                return this._map.has(key);
            }
        }
        'delete'(key) {
            const keyIsPrimitive = utils_1.isPrimitive(key);
            if (this.keyHash || keyIsPrimitive) {
                const hash = keyIsPrimitive ? key : this.keyHash(key);
                const values = this._map.get(hash);
                if (values) {
                    if (!keyIsPrimitive && this.keysEqual) {
                        for (const [mapKey,] of values) {
                            if (this.keysEqual(mapKey, key)) {
                                return values.delete(mapKey);
                            }
                        }
                    }
                    else {
                        return values.delete(key);
                    }
                }
                return false;
            }
            else {
                return this._map.delete(key);
            }
        }
        clear() {
            return this._map.clear();
        }
        *entries(useDefault = false, defaultValue = this.defaultValue) {
            for (const [key, value] of this._map.entries()) {
                if (utils_1.isPrimitive(key)) {
                    const values = value;
                    for (let pair of values) {
                        pair = [pair[0], pair[1]];
                        if (useDefault && pair[1] === undefined) {
                            pair[1] = defaultValue;
                        }
                        yield pair;
                    }
                }
                else {
                    const pair = [key, value];
                    if (useDefault && pair[1] === undefined) {
                        pair[1] = defaultValue;
                    }
                    yield pair;
                }
            }
        }
        forEach(callback, thisArg) {
            const hasThis = thisArg !== undefined;
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
    }
    exports.HashMap = HashMap;
    HashMap.prototype[Symbol.iterator] = HashMap.prototype.entries;
});
//# sourceMappingURL=HashMap.js.map