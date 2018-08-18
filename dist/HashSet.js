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
    class HashSet {
        constructor(valueHash, valuesEqual, values) {
            this._map = new Map();
            this.valueHash = valueHash;
            this.valuesEqual = valuesEqual;
            if (values) {
                for (const value of values) {
                    this.add(value);
                }
            }
        }
        get size() {
            let size = this._map.size;
            for (const [key, value] of this._map) {
                if (utils_1.isPrimitive(key)) {
                    size += value.length - 1;
                }
            }
            return size;
        }
        add(value) {
            const valueIsPrimitive = utils_1.isPrimitive(value);
            if (this.valueHash || valueIsPrimitive) {
                const hash = valueIsPrimitive ? value : this.valueHash(value);
                const values = this._map.get(hash);
                if (!values) {
                    this._map.set(hash, [value]);
                }
                else {
                    if (!valueIsPrimitive) {
                        if (this.valuesEqual) {
                            for (let i = 0; i < values.length; i++) {
                                if (this.valuesEqual(values[i], value)) {
                                    values[i] = value;
                                    return this;
                                }
                            }
                        }
                        values.push(value);
                    }
                    else {
                        for (let i = 0; i < values.length; i++) {
                            if (values[i] === value
                                || values[i] !== values[i]
                                    && value !== value) {
                                values[i] = value;
                                return this;
                            }
                        }
                    }
                }
            }
            else {
                this._map.set(value, value);
            }
            return this;
        }
        has(value) {
            const valueIsPrimitive = utils_1.isPrimitive(value);
            if (this.valueHash || valueIsPrimitive) {
                const hash = valueIsPrimitive ? value : this.valueHash(value);
                const values = this._map.get(hash);
                if (!values) {
                    return false;
                }
                else {
                    if (!valueIsPrimitive) {
                        if (this.valuesEqual) {
                            for (let i = 0; i < values.length; i++) {
                                if (this.valuesEqual(values[i], value)) {
                                    return true;
                                }
                            }
                        }
                    }
                    else {
                        for (let i = 0; i < values.length; i++) {
                            if (values[i] === value
                                || values[i] !== values[i]
                                    && value !== value) {
                                return true;
                            }
                        }
                    }
                }
            }
            else {
                return this._map.has(value);
            }
            return false;
        }
        'delete'(value) {
            const valueIsPrimitive = utils_1.isPrimitive(value);
            if (this.valueHash || valueIsPrimitive) {
                const hash = valueIsPrimitive ? value : this.valueHash(value);
                const values = this._map.get(hash);
                if (!values) {
                    return false;
                }
                else {
                    if (!valueIsPrimitive) {
                        if (this.valuesEqual) {
                            for (let i = 0; i < values.length; i++) {
                                if (this.valuesEqual(values[i], value)) {
                                    values.splice(i, 1);
                                    return true;
                                }
                            }
                        }
                    }
                    else {
                        for (let i = 0; i < values.length; i++) {
                            if (values[i] === value
                                || values[i] !== values[i]
                                    && value !== value) {
                                values.splice(i, 1);
                                return true;
                            }
                        }
                    }
                }
            }
            else {
                return this._map.delete(value);
            }
            return false;
        }
        clear() {
            return this._map.clear();
        }
        *values() {
            for (const [key, value] of this._map) {
                if (utils_1.isPrimitive(key)) {
                    const values = value;
                    for (let i = 0; i < values.length; i++) {
                        yield values[i];
                    }
                }
                else {
                    yield value;
                }
            }
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
    exports.HashSet = HashSet;
    HashSet.prototype[Symbol.iterator]
        = HashSet.prototype.entries
            = HashSet.prototype.keys
                = HashSet.prototype.values;
});
//# sourceMappingURL=HashSet.js.map