// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

// This is a specialised implementation of a System module loader.

"use strict";

// @ts-nocheck
/* eslint-disable */
let System, __instantiate;
(() => {
  const r = new Map();

  System = {
    register(id, d, f) {
      r.set(id, { d, f, exp: {} });
    },
  };
  async function dI(mid, src) {
    let id = mid.replace(/\.\w+$/i, "");
    if (id.includes("./")) {
      const [o, ...ia] = id.split("/").reverse(),
        [, ...sa] = src.split("/").reverse(),
        oa = [o];
      let s = 0,
        i;
      while ((i = ia.shift())) {
        if (i === "..") s++;
        else if (i === ".") break;
        else oa.push(i);
      }
      if (s < sa.length) oa.push(...sa.slice(s));
      id = oa.reverse().join("/");
    }
    return r.has(id) ? gExpA(id) : import(mid);
  }

  function gC(id, main) {
    return {
      id,
      import: (m) => dI(m, id),
      meta: { url: id, main },
    };
  }

  function gE(exp) {
    return (id, v) => {
      v = typeof id === "string" ? { [id]: v } : id;
      for (const [id, value] of Object.entries(v)) {
        Object.defineProperty(exp, id, {
          value,
          writable: true,
          enumerable: true,
        });
      }
    };
  }

  function rF(main) {
    for (const [id, m] of r.entries()) {
      const { f, exp } = m;
      const { execute: e, setters: s } = f(gE(exp), gC(id, id === main));
      delete m.f;
      m.e = e;
      m.s = s;
    }
  }

  async function gExpA(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](await gExpA(d[i]));
      const r = e();
      if (r) await r;
    }
    return m.exp;
  }

  function gExp(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](gExp(d[i]));
      e();
    }
    return m.exp;
  }
  __instantiate = (m, a) => {
    System = __instantiate = undefined;
    rF(m);
    return a ? gExpA(m) : gExp(m);
  };
})();

System.register("https://deno.land/std@0.65.0/encoding/_yaml/utils", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function isNothing(subject) {
        return typeof subject === "undefined" || subject === null;
    }
    exports_1("isNothing", isNothing);
    function isArray(value) {
        return Array.isArray(value);
    }
    exports_1("isArray", isArray);
    function isBoolean(value) {
        return typeof value === "boolean" || value instanceof Boolean;
    }
    exports_1("isBoolean", isBoolean);
    function isNull(value) {
        return value === null;
    }
    exports_1("isNull", isNull);
    function isNumber(value) {
        return typeof value === "number" || value instanceof Number;
    }
    exports_1("isNumber", isNumber);
    function isString(value) {
        return typeof value === "string" || value instanceof String;
    }
    exports_1("isString", isString);
    function isSymbol(value) {
        return typeof value === "symbol";
    }
    exports_1("isSymbol", isSymbol);
    function isUndefined(value) {
        return value === undefined;
    }
    exports_1("isUndefined", isUndefined);
    function isObject(value) {
        return value !== null && typeof value === "object";
    }
    exports_1("isObject", isObject);
    function isError(e) {
        return e instanceof Error;
    }
    exports_1("isError", isError);
    function isFunction(value) {
        return typeof value === "function";
    }
    exports_1("isFunction", isFunction);
    function isRegExp(value) {
        return value instanceof RegExp;
    }
    exports_1("isRegExp", isRegExp);
    function toArray(sequence) {
        if (isArray(sequence))
            return sequence;
        if (isNothing(sequence))
            return [];
        return [sequence];
    }
    exports_1("toArray", toArray);
    function repeat(str, count) {
        let result = "";
        for (let cycle = 0; cycle < count; cycle++) {
            result += str;
        }
        return result;
    }
    exports_1("repeat", repeat);
    function isNegativeZero(i) {
        return i === 0 && Number.NEGATIVE_INFINITY === 1 / i;
    }
    exports_1("isNegativeZero", isNegativeZero);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("https://deno.land/std@0.65.0/encoding/_yaml/mark", ["https://deno.land/std@0.65.0/encoding/_yaml/utils"], function (exports_2, context_2) {
    "use strict";
    var utils_ts_1, Mark;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [
            function (utils_ts_1_1) {
                utils_ts_1 = utils_ts_1_1;
            }
        ],
        execute: function () {
            Mark = class Mark {
                constructor(name, buffer, position, line, column) {
                    this.name = name;
                    this.buffer = buffer;
                    this.position = position;
                    this.line = line;
                    this.column = column;
                }
                getSnippet(indent = 4, maxLength = 75) {
                    if (!this.buffer)
                        return null;
                    let head = "";
                    let start = this.position;
                    while (start > 0 &&
                        "\x00\r\n\x85\u2028\u2029".indexOf(this.buffer.charAt(start - 1)) === -1) {
                        start -= 1;
                        if (this.position - start > maxLength / 2 - 1) {
                            head = " ... ";
                            start += 5;
                            break;
                        }
                    }
                    let tail = "";
                    let end = this.position;
                    while (end < this.buffer.length &&
                        "\x00\r\n\x85\u2028\u2029".indexOf(this.buffer.charAt(end)) === -1) {
                        end += 1;
                        if (end - this.position > maxLength / 2 - 1) {
                            tail = " ... ";
                            end -= 5;
                            break;
                        }
                    }
                    const snippet = this.buffer.slice(start, end);
                    return `${utils_ts_1.repeat(" ", indent)}${head}${snippet}${tail}\n${utils_ts_1.repeat(" ", indent + this.position - start + head.length)}^`;
                }
                toString(compact) {
                    let snippet, where = "";
                    if (this.name) {
                        where += `in "${this.name}" `;
                    }
                    where += `at line ${this.line + 1}, column ${this.column + 1}`;
                    if (!compact) {
                        snippet = this.getSnippet();
                        if (snippet) {
                            where += `:\n${snippet}`;
                        }
                    }
                    return where;
                }
            };
            exports_2("Mark", Mark);
        }
    };
});
System.register("https://deno.land/std@0.65.0/encoding/_yaml/error", [], function (exports_3, context_3) {
    "use strict";
    var YAMLError;
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [],
        execute: function () {
            YAMLError = class YAMLError extends Error {
                constructor(message = "(unknown reason)", mark = "") {
                    super(`${message} ${mark}`);
                    this.mark = mark;
                    this.name = this.constructor.name;
                }
                toString(_compact) {
                    return `${this.name}: ${this.message} ${this.mark}`;
                }
            };
            exports_3("YAMLError", YAMLError);
        }
    };
});
System.register("https://deno.land/std@0.65.0/encoding/_yaml/type", [], function (exports_4, context_4) {
    "use strict";
    var DEFAULT_RESOLVE, DEFAULT_CONSTRUCT, Type;
    var __moduleName = context_4 && context_4.id;
    function checkTagFormat(tag) {
        return tag;
    }
    return {
        setters: [],
        execute: function () {
            DEFAULT_RESOLVE = () => true;
            DEFAULT_CONSTRUCT = (data) => data;
            Type = class Type {
                constructor(tag, options) {
                    this.kind = null;
                    this.resolve = () => true;
                    this.construct = (data) => data;
                    this.tag = checkTagFormat(tag);
                    if (options) {
                        this.kind = options.kind;
                        this.resolve = options.resolve || DEFAULT_RESOLVE;
                        this.construct = options.construct || DEFAULT_CONSTRUCT;
                        this.instanceOf = options.instanceOf;
                        this.predicate = options.predicate;
                        this.represent = options.represent;
                        this.defaultStyle = options.defaultStyle;
                        this.styleAliases = options.styleAliases;
                    }
                }
            };
            exports_4("Type", Type);
        }
    };
});
System.register("https://deno.land/std@0.65.0/encoding/_yaml/schema", ["https://deno.land/std@0.65.0/encoding/_yaml/error"], function (exports_5, context_5) {
    "use strict";
    var error_ts_1, Schema;
    var __moduleName = context_5 && context_5.id;
    function compileList(schema, name, result) {
        const exclude = [];
        for (const includedSchema of schema.include) {
            result = compileList(includedSchema, name, result);
        }
        for (const currentType of schema[name]) {
            for (let previousIndex = 0; previousIndex < result.length; previousIndex++) {
                const previousType = result[previousIndex];
                if (previousType.tag === currentType.tag &&
                    previousType.kind === currentType.kind) {
                    exclude.push(previousIndex);
                }
            }
            result.push(currentType);
        }
        return result.filter((type, index) => !exclude.includes(index));
    }
    function compileMap(...typesList) {
        const result = {
            fallback: {},
            mapping: {},
            scalar: {},
            sequence: {},
        };
        for (const types of typesList) {
            for (const type of types) {
                if (type.kind !== null) {
                    result[type.kind][type.tag] = result["fallback"][type.tag] = type;
                }
            }
        }
        return result;
    }
    return {
        setters: [
            function (error_ts_1_1) {
                error_ts_1 = error_ts_1_1;
            }
        ],
        execute: function () {
            Schema = class Schema {
                constructor(definition) {
                    this.explicit = definition.explicit || [];
                    this.implicit = definition.implicit || [];
                    this.include = definition.include || [];
                    for (const type of this.implicit) {
                        if (type.loadKind && type.loadKind !== "scalar") {
                            throw new error_ts_1.YAMLError("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
                        }
                    }
                    this.compiledImplicit = compileList(this, "implicit", []);
                    this.compiledExplicit = compileList(this, "explicit", []);
                    this.compiledTypeMap = compileMap(this.compiledImplicit, this.compiledExplicit);
                }
                static create() { }
            };
            exports_5("Schema", Schema);
        }
    };
});
System.register("https://deno.land/std@0.65.0/encoding/_yaml/type/binary", ["https://deno.land/std@0.65.0/encoding/_yaml/type"], function (exports_6, context_6) {
    "use strict";
    var type_ts_1, BASE64_MAP, binary;
    var __moduleName = context_6 && context_6.id;
    function resolveYamlBinary(data) {
        if (data === null)
            return false;
        let code;
        let bitlen = 0;
        const max = data.length;
        const map = BASE64_MAP;
        for (let idx = 0; idx < max; idx++) {
            code = map.indexOf(data.charAt(idx));
            if (code > 64)
                continue;
            if (code < 0)
                return false;
            bitlen += 6;
        }
        return bitlen % 8 === 0;
    }
    function constructYamlBinary(data) {
        const input = data.replace(/[\r\n=]/g, "");
        const max = input.length;
        const map = BASE64_MAP;
        const result = [];
        let bits = 0;
        for (let idx = 0; idx < max; idx++) {
            if (idx % 4 === 0 && idx) {
                result.push((bits >> 16) & 0xff);
                result.push((bits >> 8) & 0xff);
                result.push(bits & 0xff);
            }
            bits = (bits << 6) | map.indexOf(input.charAt(idx));
        }
        const tailbits = (max % 4) * 6;
        if (tailbits === 0) {
            result.push((bits >> 16) & 0xff);
            result.push((bits >> 8) & 0xff);
            result.push(bits & 0xff);
        }
        else if (tailbits === 18) {
            result.push((bits >> 10) & 0xff);
            result.push((bits >> 2) & 0xff);
        }
        else if (tailbits === 12) {
            result.push((bits >> 4) & 0xff);
        }
        return new Deno.Buffer(new Uint8Array(result));
    }
    function representYamlBinary(object) {
        const max = object.length;
        const map = BASE64_MAP;
        let result = "";
        let bits = 0;
        for (let idx = 0; idx < max; idx++) {
            if (idx % 3 === 0 && idx) {
                result += map[(bits >> 18) & 0x3f];
                result += map[(bits >> 12) & 0x3f];
                result += map[(bits >> 6) & 0x3f];
                result += map[bits & 0x3f];
            }
            bits = (bits << 8) + object[idx];
        }
        const tail = max % 3;
        if (tail === 0) {
            result += map[(bits >> 18) & 0x3f];
            result += map[(bits >> 12) & 0x3f];
            result += map[(bits >> 6) & 0x3f];
            result += map[bits & 0x3f];
        }
        else if (tail === 2) {
            result += map[(bits >> 10) & 0x3f];
            result += map[(bits >> 4) & 0x3f];
            result += map[(bits << 2) & 0x3f];
            result += map[64];
        }
        else if (tail === 1) {
            result += map[(bits >> 2) & 0x3f];
            result += map[(bits << 4) & 0x3f];
            result += map[64];
            result += map[64];
        }
        return result;
    }
    function isBinary(obj) {
        const buf = new Deno.Buffer();
        try {
            if (0 > buf.readFromSync(obj))
                return true;
            return false;
        }
        catch {
            return false;
        }
        finally {
            buf.reset();
        }
    }
    return {
        setters: [
            function (type_ts_1_1) {
                type_ts_1 = type_ts_1_1;
            }
        ],
        execute: function () {
            BASE64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";
            exports_6("binary", binary = new type_ts_1.Type("tag:yaml.org,2002:binary", {
                construct: constructYamlBinary,
                kind: "scalar",
                predicate: isBinary,
                represent: representYamlBinary,
                resolve: resolveYamlBinary,
            }));
        }
    };
});
System.register("https://deno.land/std@0.65.0/encoding/_yaml/type/bool", ["https://deno.land/std@0.65.0/encoding/_yaml/type", "https://deno.land/std@0.65.0/encoding/_yaml/utils"], function (exports_7, context_7) {
    "use strict";
    var type_ts_2, utils_ts_2, bool;
    var __moduleName = context_7 && context_7.id;
    function resolveYamlBoolean(data) {
        const max = data.length;
        return ((max === 4 && (data === "true" || data === "True" || data === "TRUE")) ||
            (max === 5 && (data === "false" || data === "False" || data === "FALSE")));
    }
    function constructYamlBoolean(data) {
        return data === "true" || data === "True" || data === "TRUE";
    }
    return {
        setters: [
            function (type_ts_2_1) {
                type_ts_2 = type_ts_2_1;
            },
            function (utils_ts_2_1) {
                utils_ts_2 = utils_ts_2_1;
            }
        ],
        execute: function () {
            exports_7("bool", bool = new type_ts_2.Type("tag:yaml.org,2002:bool", {
                construct: constructYamlBoolean,
                defaultStyle: "lowercase",
                kind: "scalar",
                predicate: utils_ts_2.isBoolean,
                represent: {
                    lowercase(object) {
                        return object ? "true" : "false";
                    },
                    uppercase(object) {
                        return object ? "TRUE" : "FALSE";
                    },
                    camelcase(object) {
                        return object ? "True" : "False";
                    },
                },
                resolve: resolveYamlBoolean,
            }));
        }
    };
});
System.register("https://deno.land/std@0.65.0/encoding/_yaml/type/float", ["https://deno.land/std@0.65.0/encoding/_yaml/type", "https://deno.land/std@0.65.0/encoding/_yaml/utils"], function (exports_8, context_8) {
    "use strict";
    var type_ts_3, utils_ts_3, YAML_FLOAT_PATTERN, SCIENTIFIC_WITHOUT_DOT, float;
    var __moduleName = context_8 && context_8.id;
    function resolveYamlFloat(data) {
        if (!YAML_FLOAT_PATTERN.test(data) ||
            data[data.length - 1] === "_") {
            return false;
        }
        return true;
    }
    function constructYamlFloat(data) {
        let value = data.replace(/_/g, "").toLowerCase();
        const sign = value[0] === "-" ? -1 : 1;
        const digits = [];
        if ("+-".indexOf(value[0]) >= 0) {
            value = value.slice(1);
        }
        if (value === ".inf") {
            return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
        }
        if (value === ".nan") {
            return NaN;
        }
        if (value.indexOf(":") >= 0) {
            value.split(":").forEach((v) => {
                digits.unshift(parseFloat(v));
            });
            let valueNb = 0.0;
            let base = 1;
            digits.forEach((d) => {
                valueNb += d * base;
                base *= 60;
            });
            return sign * valueNb;
        }
        return sign * parseFloat(value);
    }
    function representYamlFloat(object, style) {
        if (isNaN(object)) {
            switch (style) {
                case "lowercase":
                    return ".nan";
                case "uppercase":
                    return ".NAN";
                case "camelcase":
                    return ".NaN";
            }
        }
        else if (Number.POSITIVE_INFINITY === object) {
            switch (style) {
                case "lowercase":
                    return ".inf";
                case "uppercase":
                    return ".INF";
                case "camelcase":
                    return ".Inf";
            }
        }
        else if (Number.NEGATIVE_INFINITY === object) {
            switch (style) {
                case "lowercase":
                    return "-.inf";
                case "uppercase":
                    return "-.INF";
                case "camelcase":
                    return "-.Inf";
            }
        }
        else if (utils_ts_3.isNegativeZero(object)) {
            return "-0.0";
        }
        const res = object.toString(10);
        return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
    }
    function isFloat(object) {
        return (Object.prototype.toString.call(object) === "[object Number]" &&
            (object % 1 !== 0 || utils_ts_3.isNegativeZero(object)));
    }
    return {
        setters: [
            function (type_ts_3_1) {
                type_ts_3 = type_ts_3_1;
            },
            function (utils_ts_3_1) {
                utils_ts_3 = utils_ts_3_1;
            }
        ],
        execute: function () {
            YAML_FLOAT_PATTERN = new RegExp("^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?" +
                "|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?" +
                "|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*" +
                "|[-+]?\\.(?:inf|Inf|INF)" +
                "|\\.(?:nan|NaN|NAN))$");
            SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
            exports_8("float", float = new type_ts_3.Type("tag:yaml.org,2002:float", {
                construct: constructYamlFloat,
                defaultStyle: "lowercase",
                kind: "scalar",
                predicate: isFloat,
                represent: representYamlFloat,
                resolve: resolveYamlFloat,
            }));
        }
    };
});
System.register("https://deno.land/std@0.65.0/encoding/_yaml/type/int", ["https://deno.land/std@0.65.0/encoding/_yaml/type", "https://deno.land/std@0.65.0/encoding/_yaml/utils"], function (exports_9, context_9) {
    "use strict";
    var type_ts_4, utils_ts_4, int;
    var __moduleName = context_9 && context_9.id;
    function isHexCode(c) {
        return ((0x30 <= c && c <= 0x39) ||
            (0x41 <= c && c <= 0x46) ||
            (0x61 <= c && c <= 0x66));
    }
    function isOctCode(c) {
        return 0x30 <= c && c <= 0x37;
    }
    function isDecCode(c) {
        return 0x30 <= c && c <= 0x39;
    }
    function resolveYamlInteger(data) {
        const max = data.length;
        let index = 0;
        let hasDigits = false;
        if (!max)
            return false;
        let ch = data[index];
        if (ch === "-" || ch === "+") {
            ch = data[++index];
        }
        if (ch === "0") {
            if (index + 1 === max)
                return true;
            ch = data[++index];
            if (ch === "b") {
                index++;
                for (; index < max; index++) {
                    ch = data[index];
                    if (ch === "_")
                        continue;
                    if (ch !== "0" && ch !== "1")
                        return false;
                    hasDigits = true;
                }
                return hasDigits && ch !== "_";
            }
            if (ch === "x") {
                index++;
                for (; index < max; index++) {
                    ch = data[index];
                    if (ch === "_")
                        continue;
                    if (!isHexCode(data.charCodeAt(index)))
                        return false;
                    hasDigits = true;
                }
                return hasDigits && ch !== "_";
            }
            for (; index < max; index++) {
                ch = data[index];
                if (ch === "_")
                    continue;
                if (!isOctCode(data.charCodeAt(index)))
                    return false;
                hasDigits = true;
            }
            return hasDigits && ch !== "_";
        }
        if (ch === "_")
            return false;
        for (; index < max; index++) {
            ch = data[index];
            if (ch === "_")
                continue;
            if (ch === ":")
                break;
            if (!isDecCode(data.charCodeAt(index))) {
                return false;
            }
            hasDigits = true;
        }
        if (!hasDigits || ch === "_")
            return false;
        if (ch !== ":")
            return true;
        return /^(:[0-5]?[0-9])+$/.test(data.slice(index));
    }
    function constructYamlInteger(data) {
        let value = data;
        const digits = [];
        if (value.indexOf("_") !== -1) {
            value = value.replace(/_/g, "");
        }
        let sign = 1;
        let ch = value[0];
        if (ch === "-" || ch === "+") {
            if (ch === "-")
                sign = -1;
            value = value.slice(1);
            ch = value[0];
        }
        if (value === "0")
            return 0;
        if (ch === "0") {
            if (value[1] === "b")
                return sign * parseInt(value.slice(2), 2);
            if (value[1] === "x")
                return sign * parseInt(value, 16);
            return sign * parseInt(value, 8);
        }
        if (value.indexOf(":") !== -1) {
            value.split(":").forEach((v) => {
                digits.unshift(parseInt(v, 10));
            });
            let valueInt = 0;
            let base = 1;
            digits.forEach((d) => {
                valueInt += d * base;
                base *= 60;
            });
            return sign * valueInt;
        }
        return sign * parseInt(value, 10);
    }
    function isInteger(object) {
        return (Object.prototype.toString.call(object) === "[object Number]" &&
            object % 1 === 0 &&
            !utils_ts_4.isNegativeZero(object));
    }
    return {
        setters: [
            function (type_ts_4_1) {
                type_ts_4 = type_ts_4_1;
            },
            function (utils_ts_4_1) {
                utils_ts_4 = utils_ts_4_1;
            }
        ],
        execute: function () {
            exports_9("int", int = new type_ts_4.Type("tag:yaml.org,2002:int", {
                construct: constructYamlInteger,
                defaultStyle: "decimal",
                kind: "scalar",
                predicate: isInteger,
                represent: {
                    binary(obj) {
                        return obj >= 0
                            ? `0b${obj.toString(2)}`
                            : `-0b${obj.toString(2).slice(1)}`;
                    },
                    octal(obj) {
                        return obj >= 0 ? `0${obj.toString(8)}` : `-0${obj.toString(8).slice(1)}`;
                    },
                    decimal(obj) {
                        return obj.toString(10);
                    },
                    hexadecimal(obj) {
                        return obj >= 0
                            ? `0x${obj.toString(16).toUpperCase()}`
                            : `-0x${obj.toString(16).toUpperCase().slice(1)}`;
                    },
                },
                resolve: resolveYamlInteger,
                styleAliases: {
                    binary: [2, "bin"],
                    decimal: [10, "dec"],
                    hexadecimal: [16, "hex"],
                    octal: [8, "oct"],
                },
            }));
        }
    };
});
System.register("https://deno.land/std@0.65.0/encoding/_yaml/type/map", ["https://deno.land/std@0.65.0/encoding/_yaml/type"], function (exports_10, context_10) {
    "use strict";
    var type_ts_5, map;
    var __moduleName = context_10 && context_10.id;
    return {
        setters: [
            function (type_ts_5_1) {
                type_ts_5 = type_ts_5_1;
            }
        ],
        execute: function () {
            exports_10("map", map = new type_ts_5.Type("tag:yaml.org,2002:map", {
                construct(data) {
                    return data !== null ? data : {};
                },
                kind: "mapping",
            }));
        }
    };
});
System.register("https://deno.land/std@0.65.0/encoding/_yaml/type/merge", ["https://deno.land/std@0.65.0/encoding/_yaml/type"], function (exports_11, context_11) {
    "use strict";
    var type_ts_6, merge;
    var __moduleName = context_11 && context_11.id;
    function resolveYamlMerge(data) {
        return data === "<<" || data === null;
    }
    return {
        setters: [
            function (type_ts_6_1) {
                type_ts_6 = type_ts_6_1;
            }
        ],
        execute: function () {
            exports_11("merge", merge = new type_ts_6.Type("tag:yaml.org,2002:merge", {
                kind: "scalar",
                resolve: resolveYamlMerge,
            }));
        }
    };
});
System.register("https://deno.land/std@0.65.0/encoding/_yaml/type/nil", ["https://deno.land/std@0.65.0/encoding/_yaml/type"], function (exports_12, context_12) {
    "use strict";
    var type_ts_7, nil;
    var __moduleName = context_12 && context_12.id;
    function resolveYamlNull(data) {
        const max = data.length;
        return ((max === 1 && data === "~") ||
            (max === 4 && (data === "null" || data === "Null" || data === "NULL")));
    }
    function constructYamlNull() {
        return null;
    }
    function isNull(object) {
        return object === null;
    }
    return {
        setters: [
            function (type_ts_7_1) {
                type_ts_7 = type_ts_7_1;
            }
        ],
        execute: function () {
            exports_12("nil", nil = new type_ts_7.Type("tag:yaml.org,2002:null", {
                construct: constructYamlNull,
                defaultStyle: "lowercase",
                kind: "scalar",
                predicate: isNull,
                represent: {
                    canonical() {
                        return "~";
                    },
                    lowercase() {
                        return "null";
                    },
                    uppercase() {
                        return "NULL";
                    },
                    camelcase() {
                        return "Null";
                    },
                },
                resolve: resolveYamlNull,
            }));
        }
    };
});
System.register("https://deno.land/std@0.65.0/encoding/_yaml/type/omap", ["https://deno.land/std@0.65.0/encoding/_yaml/type"], function (exports_13, context_13) {
    "use strict";
    var type_ts_8, _hasOwnProperty, _toString, omap;
    var __moduleName = context_13 && context_13.id;
    function resolveYamlOmap(data) {
        const objectKeys = [];
        let pairKey = "";
        let pairHasKey = false;
        for (const pair of data) {
            pairHasKey = false;
            if (_toString.call(pair) !== "[object Object]")
                return false;
            for (pairKey in pair) {
                if (_hasOwnProperty.call(pair, pairKey)) {
                    if (!pairHasKey)
                        pairHasKey = true;
                    else
                        return false;
                }
            }
            if (!pairHasKey)
                return false;
            if (objectKeys.indexOf(pairKey) === -1)
                objectKeys.push(pairKey);
            else
                return false;
        }
        return true;
    }
    function constructYamlOmap(data) {
        return data !== null ? data : [];
    }
    return {
        setters: [
            function (type_ts_8_1) {
                type_ts_8 = type_ts_8_1;
            }
        ],
        execute: function () {
            _hasOwnProperty = Object.prototype.hasOwnProperty;
            _toString = Object.prototype.toString;
            exports_13("omap", omap = new type_ts_8.Type("tag:yaml.org,2002:omap", {
                construct: constructYamlOmap,
                kind: "sequence",
                resolve: resolveYamlOmap,
            }));
        }
    };
});
System.register("https://deno.land/std@0.65.0/encoding/_yaml/type/pairs", ["https://deno.land/std@0.65.0/encoding/_yaml/type"], function (exports_14, context_14) {
    "use strict";
    var type_ts_9, _toString, pairs;
    var __moduleName = context_14 && context_14.id;
    function resolveYamlPairs(data) {
        const result = new Array(data.length);
        for (let index = 0; index < data.length; index++) {
            const pair = data[index];
            if (_toString.call(pair) !== "[object Object]")
                return false;
            const keys = Object.keys(pair);
            if (keys.length !== 1)
                return false;
            result[index] = [keys[0], pair[keys[0]]];
        }
        return true;
    }
    function constructYamlPairs(data) {
        if (data === null)
            return [];
        const result = new Array(data.length);
        for (let index = 0; index < data.length; index += 1) {
            const pair = data[index];
            const keys = Object.keys(pair);
            result[index] = [keys[0], pair[keys[0]]];
        }
        return result;
    }
    return {
        setters: [
            function (type_ts_9_1) {
                type_ts_9 = type_ts_9_1;
            }
        ],
        execute: function () {
            _toString = Object.prototype.toString;
            exports_14("pairs", pairs = new type_ts_9.Type("tag:yaml.org,2002:pairs", {
                construct: constructYamlPairs,
                kind: "sequence",
                resolve: resolveYamlPairs,
            }));
        }
    };
});
System.register("https://deno.land/std@0.65.0/encoding/_yaml/type/seq", ["https://deno.land/std@0.65.0/encoding/_yaml/type"], function (exports_15, context_15) {
    "use strict";
    var type_ts_10, seq;
    var __moduleName = context_15 && context_15.id;
    return {
        setters: [
            function (type_ts_10_1) {
                type_ts_10 = type_ts_10_1;
            }
        ],
        execute: function () {
            exports_15("seq", seq = new type_ts_10.Type("tag:yaml.org,2002:seq", {
                construct(data) {
                    return data !== null ? data : [];
                },
                kind: "sequence",
            }));
        }
    };
});
System.register("https://deno.land/std@0.65.0/encoding/_yaml/type/set", ["https://deno.land/std@0.65.0/encoding/_yaml/type"], function (exports_16, context_16) {
    "use strict";
    var type_ts_11, _hasOwnProperty, set;
    var __moduleName = context_16 && context_16.id;
    function resolveYamlSet(data) {
        if (data === null)
            return true;
        for (const key in data) {
            if (_hasOwnProperty.call(data, key)) {
                if (data[key] !== null)
                    return false;
            }
        }
        return true;
    }
    function constructYamlSet(data) {
        return data !== null ? data : {};
    }
    return {
        setters: [
            function (type_ts_11_1) {
                type_ts_11 = type_ts_11_1;
            }
        ],
        execute: function () {
            _hasOwnProperty = Object.prototype.hasOwnProperty;
            exports_16("set", set = new type_ts_11.Type("tag:yaml.org,2002:set", {
                construct: constructYamlSet,
                kind: "mapping",
                resolve: resolveYamlSet,
            }));
        }
    };
});
System.register("https://deno.land/std@0.65.0/encoding/_yaml/type/str", ["https://deno.land/std@0.65.0/encoding/_yaml/type"], function (exports_17, context_17) {
    "use strict";
    var type_ts_12, str;
    var __moduleName = context_17 && context_17.id;
    return {
        setters: [
            function (type_ts_12_1) {
                type_ts_12 = type_ts_12_1;
            }
        ],
        execute: function () {
            exports_17("str", str = new type_ts_12.Type("tag:yaml.org,2002:str", {
                construct(data) {
                    return data !== null ? data : "";
                },
                kind: "scalar",
            }));
        }
    };
});
System.register("https://deno.land/std@0.65.0/encoding/_yaml/type/timestamp", ["https://deno.land/std@0.65.0/encoding/_yaml/type"], function (exports_18, context_18) {
    "use strict";
    var type_ts_13, YAML_DATE_REGEXP, YAML_TIMESTAMP_REGEXP, timestamp;
    var __moduleName = context_18 && context_18.id;
    function resolveYamlTimestamp(data) {
        if (data === null)
            return false;
        if (YAML_DATE_REGEXP.exec(data) !== null)
            return true;
        if (YAML_TIMESTAMP_REGEXP.exec(data) !== null)
            return true;
        return false;
    }
    function constructYamlTimestamp(data) {
        let match = YAML_DATE_REGEXP.exec(data);
        if (match === null)
            match = YAML_TIMESTAMP_REGEXP.exec(data);
        if (match === null)
            throw new Error("Date resolve error");
        const year = +match[1];
        const month = +match[2] - 1;
        const day = +match[3];
        if (!match[4]) {
            return new Date(Date.UTC(year, month, day));
        }
        const hour = +match[4];
        const minute = +match[5];
        const second = +match[6];
        let fraction = 0;
        if (match[7]) {
            let partFraction = match[7].slice(0, 3);
            while (partFraction.length < 3) {
                partFraction += "0";
            }
            fraction = +partFraction;
        }
        let delta = null;
        if (match[9]) {
            const tzHour = +match[10];
            const tzMinute = +(match[11] || 0);
            delta = (tzHour * 60 + tzMinute) * 60000;
            if (match[9] === "-")
                delta = -delta;
        }
        const date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
        if (delta)
            date.setTime(date.getTime() - delta);
        return date;
    }
    function representYamlTimestamp(date) {
        return date.toISOString();
    }
    return {
        setters: [
            function (type_ts_13_1) {
                type_ts_13 = type_ts_13_1;
            }
        ],
        execute: function () {
            YAML_DATE_REGEXP = new RegExp("^([0-9][0-9][0-9][0-9])" +
                "-([0-9][0-9])" +
                "-([0-9][0-9])$");
            YAML_TIMESTAMP_REGEXP = new RegExp("^([0-9][0-9][0-9][0-9])" +
                "-([0-9][0-9]?)" +
                "-([0-9][0-9]?)" +
                "(?:[Tt]|[ \\t]+)" +
                "([0-9][0-9]?)" +
                ":([0-9][0-9])" +
                ":([0-9][0-9])" +
                "(?:\\.([0-9]*))?" +
                "(?:[ \\t]*(Z|([-+])([0-9][0-9]?)" +
                "(?::([0-9][0-9]))?))?$");
            exports_18("timestamp", timestamp = new type_ts_13.Type("tag:yaml.org,2002:timestamp", {
                construct: constructYamlTimestamp,
                instanceOf: Date,
                kind: "scalar",
                represent: representYamlTimestamp,
                resolve: resolveYamlTimestamp,
            }));
        }
    };
});
System.register("https://deno.land/std@0.65.0/encoding/_yaml/type/mod", ["https://deno.land/std@0.65.0/encoding/_yaml/type/binary", "https://deno.land/std@0.65.0/encoding/_yaml/type/bool", "https://deno.land/std@0.65.0/encoding/_yaml/type/float", "https://deno.land/std@0.65.0/encoding/_yaml/type/int", "https://deno.land/std@0.65.0/encoding/_yaml/type/map", "https://deno.land/std@0.65.0/encoding/_yaml/type/merge", "https://deno.land/std@0.65.0/encoding/_yaml/type/nil", "https://deno.land/std@0.65.0/encoding/_yaml/type/omap", "https://deno.land/std@0.65.0/encoding/_yaml/type/pairs", "https://deno.land/std@0.65.0/encoding/_yaml/type/seq", "https://deno.land/std@0.65.0/encoding/_yaml/type/set", "https://deno.land/std@0.65.0/encoding/_yaml/type/str", "https://deno.land/std@0.65.0/encoding/_yaml/type/timestamp"], function (exports_19, context_19) {
    "use strict";
    var __moduleName = context_19 && context_19.id;
    return {
        setters: [
            function (binary_ts_1_1) {
                exports_19({
                    "binary": binary_ts_1_1["binary"]
                });
            },
            function (bool_ts_1_1) {
                exports_19({
                    "bool": bool_ts_1_1["bool"]
                });
            },
            function (float_ts_1_1) {
                exports_19({
                    "float": float_ts_1_1["float"]
                });
            },
            function (int_ts_1_1) {
                exports_19({
                    "int": int_ts_1_1["int"]
                });
            },
            function (map_ts_1_1) {
                exports_19({
                    "map": map_ts_1_1["map"]
                });
            },
            function (merge_ts_1_1) {
                exports_19({
                    "merge": merge_ts_1_1["merge"]
                });
            },
            function (nil_ts_1_1) {
                exports_19({
                    "nil": nil_ts_1_1["nil"]
                });
            },
            function (omap_ts_1_1) {
                exports_19({
                    "omap": omap_ts_1_1["omap"]
                });
            },
            function (pairs_ts_1_1) {
                exports_19({
                    "pairs": pairs_ts_1_1["pairs"]
                });
            },
            function (seq_ts_1_1) {
                exports_19({
                    "seq": seq_ts_1_1["seq"]
                });
            },
            function (set_ts_1_1) {
                exports_19({
                    "set": set_ts_1_1["set"]
                });
            },
            function (str_ts_1_1) {
                exports_19({
                    "str": str_ts_1_1["str"]
                });
            },
            function (timestamp_ts_1_1) {
                exports_19({
                    "timestamp": timestamp_ts_1_1["timestamp"]
                });
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/std@0.65.0/encoding/_yaml/schema/failsafe", ["https://deno.land/std@0.65.0/encoding/_yaml/schema", "https://deno.land/std@0.65.0/encoding/_yaml/type/mod"], function (exports_20, context_20) {
    "use strict";
    var schema_ts_1, mod_ts_1, failsafe;
    var __moduleName = context_20 && context_20.id;
    return {
        setters: [
            function (schema_ts_1_1) {
                schema_ts_1 = schema_ts_1_1;
            },
            function (mod_ts_1_1) {
                mod_ts_1 = mod_ts_1_1;
            }
        ],
        execute: function () {
            exports_20("failsafe", failsafe = new schema_ts_1.Schema({
                explicit: [mod_ts_1.str, mod_ts_1.seq, mod_ts_1.map],
            }));
        }
    };
});
System.register("https://deno.land/std@0.65.0/encoding/_yaml/schema/json", ["https://deno.land/std@0.65.0/encoding/_yaml/schema", "https://deno.land/std@0.65.0/encoding/_yaml/type/mod", "https://deno.land/std@0.65.0/encoding/_yaml/schema/failsafe"], function (exports_21, context_21) {
    "use strict";
    var schema_ts_2, mod_ts_2, failsafe_ts_1, json;
    var __moduleName = context_21 && context_21.id;
    return {
        setters: [
            function (schema_ts_2_1) {
                schema_ts_2 = schema_ts_2_1;
            },
            function (mod_ts_2_1) {
                mod_ts_2 = mod_ts_2_1;
            },
            function (failsafe_ts_1_1) {
                failsafe_ts_1 = failsafe_ts_1_1;
            }
        ],
        execute: function () {
            exports_21("json", json = new schema_ts_2.Schema({
                implicit: [mod_ts_2.nil, mod_ts_2.bool, mod_ts_2.int, mod_ts_2.float],
                include: [failsafe_ts_1.failsafe],
            }));
        }
    };
});
System.register("https://deno.land/std@0.65.0/encoding/_yaml/schema/core", ["https://deno.land/std@0.65.0/encoding/_yaml/schema", "https://deno.land/std@0.65.0/encoding/_yaml/schema/json"], function (exports_22, context_22) {
    "use strict";
    var schema_ts_3, json_ts_1, core;
    var __moduleName = context_22 && context_22.id;
    return {
        setters: [
            function (schema_ts_3_1) {
                schema_ts_3 = schema_ts_3_1;
            },
            function (json_ts_1_1) {
                json_ts_1 = json_ts_1_1;
            }
        ],
        execute: function () {
            exports_22("core", core = new schema_ts_3.Schema({
                include: [json_ts_1.json],
            }));
        }
    };
});
System.register("https://deno.land/std@0.65.0/encoding/_yaml/schema/default", ["https://deno.land/std@0.65.0/encoding/_yaml/schema", "https://deno.land/std@0.65.0/encoding/_yaml/type/mod", "https://deno.land/std@0.65.0/encoding/_yaml/schema/core"], function (exports_23, context_23) {
    "use strict";
    var schema_ts_4, mod_ts_3, core_ts_1, def;
    var __moduleName = context_23 && context_23.id;
    return {
        setters: [
            function (schema_ts_4_1) {
                schema_ts_4 = schema_ts_4_1;
            },
            function (mod_ts_3_1) {
                mod_ts_3 = mod_ts_3_1;
            },
            function (core_ts_1_1) {
                core_ts_1 = core_ts_1_1;
            }
        ],
        execute: function () {
            exports_23("def", def = new schema_ts_4.Schema({
                explicit: [mod_ts_3.binary, mod_ts_3.omap, mod_ts_3.pairs, mod_ts_3.set],
                implicit: [mod_ts_3.timestamp, mod_ts_3.merge],
                include: [core_ts_1.core],
            }));
        }
    };
});
System.register("https://deno.land/std@0.65.0/encoding/_yaml/schema/mod", ["https://deno.land/std@0.65.0/encoding/_yaml/schema/core", "https://deno.land/std@0.65.0/encoding/_yaml/schema/default", "https://deno.land/std@0.65.0/encoding/_yaml/schema/failsafe", "https://deno.land/std@0.65.0/encoding/_yaml/schema/json"], function (exports_24, context_24) {
    "use strict";
    var __moduleName = context_24 && context_24.id;
    return {
        setters: [
            function (core_ts_2_1) {
                exports_24({
                    "CORE_SCHEMA": core_ts_2_1["core"]
                });
            },
            function (default_ts_1_1) {
                exports_24({
                    "DEFAULT_SCHEMA": default_ts_1_1["def"]
                });
            },
            function (failsafe_ts_2_1) {
                exports_24({
                    "FAILSAFE_SCHEMA": failsafe_ts_2_1["failsafe"]
                });
            },
            function (json_ts_2_1) {
                exports_24({
                    "JSON_SCHEMA": json_ts_2_1["json"]
                });
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/std@0.65.0/encoding/_yaml/state", ["https://deno.land/std@0.65.0/encoding/_yaml/schema/mod"], function (exports_25, context_25) {
    "use strict";
    var mod_ts_4, State;
    var __moduleName = context_25 && context_25.id;
    return {
        setters: [
            function (mod_ts_4_1) {
                mod_ts_4 = mod_ts_4_1;
            }
        ],
        execute: function () {
            State = class State {
                constructor(schema = mod_ts_4.DEFAULT_SCHEMA) {
                    this.schema = schema;
                }
            };
            exports_25("State", State);
        }
    };
});
System.register("https://deno.land/std@0.65.0/encoding/_yaml/loader/loader_state", ["https://deno.land/std@0.65.0/encoding/_yaml/state"], function (exports_26, context_26) {
    "use strict";
    var state_ts_1, LoaderState;
    var __moduleName = context_26 && context_26.id;
    return {
        setters: [
            function (state_ts_1_1) {
                state_ts_1 = state_ts_1_1;
            }
        ],
        execute: function () {
            LoaderState = class LoaderState extends state_ts_1.State {
                constructor(input, { filename, schema, onWarning, legacy = false, json = false, listener = null, }) {
                    super(schema);
                    this.input = input;
                    this.documents = [];
                    this.lineIndent = 0;
                    this.lineStart = 0;
                    this.position = 0;
                    this.line = 0;
                    this.result = "";
                    this.filename = filename;
                    this.onWarning = onWarning;
                    this.legacy = legacy;
                    this.json = json;
                    this.listener = listener;
                    this.implicitTypes = this.schema.compiledImplicit;
                    this.typeMap = this.schema.compiledTypeMap;
                    this.length = input.length;
                }
            };
            exports_26("LoaderState", LoaderState);
        }
    };
});
System.register("https://deno.land/std@0.65.0/encoding/_yaml/loader/loader", ["https://deno.land/std@0.65.0/encoding/_yaml/error", "https://deno.land/std@0.65.0/encoding/_yaml/mark", "https://deno.land/std@0.65.0/encoding/_yaml/utils", "https://deno.land/std@0.65.0/encoding/_yaml/loader/loader_state"], function (exports_27, context_27) {
    "use strict";
    var error_ts_2, mark_ts_1, common, loader_state_ts_1, _hasOwnProperty, CONTEXT_FLOW_IN, CONTEXT_FLOW_OUT, CONTEXT_BLOCK_IN, CONTEXT_BLOCK_OUT, CHOMPING_CLIP, CHOMPING_STRIP, CHOMPING_KEEP, PATTERN_NON_PRINTABLE, PATTERN_NON_ASCII_LINE_BREAKS, PATTERN_FLOW_INDICATORS, PATTERN_TAG_HANDLE, PATTERN_TAG_URI, simpleEscapeCheck, simpleEscapeMap, directiveHandlers;
    var __moduleName = context_27 && context_27.id;
    function _class(obj) {
        return Object.prototype.toString.call(obj);
    }
    function isEOL(c) {
        return c === 0x0a || c === 0x0d;
    }
    function isWhiteSpace(c) {
        return c === 0x09 || c === 0x20;
    }
    function isWsOrEol(c) {
        return (c === 0x09 ||
            c === 0x20 ||
            c === 0x0a ||
            c === 0x0d);
    }
    function isFlowIndicator(c) {
        return (c === 0x2c ||
            c === 0x5b ||
            c === 0x5d ||
            c === 0x7b ||
            c === 0x7d);
    }
    function fromHexCode(c) {
        if (0x30 <= c && c <= 0x39) {
            return c - 0x30;
        }
        const lc = c | 0x20;
        if (0x61 <= lc && lc <= 0x66) {
            return lc - 0x61 + 10;
        }
        return -1;
    }
    function escapedHexLen(c) {
        if (c === 0x78) {
            return 2;
        }
        if (c === 0x75) {
            return 4;
        }
        if (c === 0x55) {
            return 8;
        }
        return 0;
    }
    function fromDecimalCode(c) {
        if (0x30 <= c && c <= 0x39) {
            return c - 0x30;
        }
        return -1;
    }
    function simpleEscapeSequence(c) {
        return c === 0x30
            ? "\x00"
            : c === 0x61
                ? "\x07"
                : c === 0x62
                    ? "\x08"
                    : c === 0x74
                        ? "\x09"
                        : c === 0x09
                            ? "\x09"
                            : c === 0x6e
                                ? "\x0A"
                                : c === 0x76
                                    ? "\x0B"
                                    : c === 0x66
                                        ? "\x0C"
                                        : c === 0x72
                                            ? "\x0D"
                                            : c === 0x65
                                                ? "\x1B"
                                                : c === 0x20
                                                    ? " "
                                                    : c === 0x22
                                                        ? "\x22"
                                                        : c === 0x2f
                                                            ? "/"
                                                            : c === 0x5c
                                                                ? "\x5C"
                                                                : c === 0x4e
                                                                    ? "\x85"
                                                                    : c === 0x5f
                                                                        ? "\xA0"
                                                                        : c === 0x4c
                                                                            ? "\u2028"
                                                                            : c === 0x50
                                                                                ? "\u2029"
                                                                                : "";
    }
    function charFromCodepoint(c) {
        if (c <= 0xffff) {
            return String.fromCharCode(c);
        }
        return String.fromCharCode(((c - 0x010000) >> 10) + 0xd800, ((c - 0x010000) & 0x03ff) + 0xdc00);
    }
    function generateError(state, message) {
        return new error_ts_2.YAMLError(message, new mark_ts_1.Mark(state.filename, state.input, state.position, state.line, state.position - state.lineStart));
    }
    function throwError(state, message) {
        throw generateError(state, message);
    }
    function throwWarning(state, message) {
        if (state.onWarning) {
            state.onWarning.call(null, generateError(state, message));
        }
    }
    function captureSegment(state, start, end, checkJson) {
        let result;
        if (start < end) {
            result = state.input.slice(start, end);
            if (checkJson) {
                for (let position = 0, length = result.length; position < length; position++) {
                    const character = result.charCodeAt(position);
                    if (!(character === 0x09 || (0x20 <= character && character <= 0x10ffff))) {
                        return throwError(state, "expected valid JSON character");
                    }
                }
            }
            else if (PATTERN_NON_PRINTABLE.test(result)) {
                return throwError(state, "the stream contains non-printable characters");
            }
            state.result += result;
        }
    }
    function mergeMappings(state, destination, source, overridableKeys) {
        if (!common.isObject(source)) {
            return throwError(state, "cannot merge mappings; the provided source object is unacceptable");
        }
        const keys = Object.keys(source);
        for (let i = 0, len = keys.length; i < len; i++) {
            const key = keys[i];
            if (!_hasOwnProperty.call(destination, key)) {
                destination[key] = source[key];
                overridableKeys[key] = true;
            }
        }
    }
    function storeMappingPair(state, result, overridableKeys, keyTag, keyNode, valueNode, startLine, startPos) {
        if (Array.isArray(keyNode)) {
            keyNode = Array.prototype.slice.call(keyNode);
            for (let index = 0, quantity = keyNode.length; index < quantity; index++) {
                if (Array.isArray(keyNode[index])) {
                    return throwError(state, "nested arrays are not supported inside keys");
                }
                if (typeof keyNode === "object" &&
                    _class(keyNode[index]) === "[object Object]") {
                    keyNode[index] = "[object Object]";
                }
            }
        }
        if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") {
            keyNode = "[object Object]";
        }
        keyNode = String(keyNode);
        if (result === null) {
            result = {};
        }
        if (keyTag === "tag:yaml.org,2002:merge") {
            if (Array.isArray(valueNode)) {
                for (let index = 0, quantity = valueNode.length; index < quantity; index++) {
                    mergeMappings(state, result, valueNode[index], overridableKeys);
                }
            }
            else {
                mergeMappings(state, result, valueNode, overridableKeys);
            }
        }
        else {
            if (!state.json &&
                !_hasOwnProperty.call(overridableKeys, keyNode) &&
                _hasOwnProperty.call(result, keyNode)) {
                state.line = startLine || state.line;
                state.position = startPos || state.position;
                return throwError(state, "duplicated mapping key");
            }
            result[keyNode] = valueNode;
            delete overridableKeys[keyNode];
        }
        return result;
    }
    function readLineBreak(state) {
        const ch = state.input.charCodeAt(state.position);
        if (ch === 0x0a) {
            state.position++;
        }
        else if (ch === 0x0d) {
            state.position++;
            if (state.input.charCodeAt(state.position) === 0x0a) {
                state.position++;
            }
        }
        else {
            return throwError(state, "a line break is expected");
        }
        state.line += 1;
        state.lineStart = state.position;
    }
    function skipSeparationSpace(state, allowComments, checkIndent) {
        let lineBreaks = 0, ch = state.input.charCodeAt(state.position);
        while (ch !== 0) {
            while (isWhiteSpace(ch)) {
                ch = state.input.charCodeAt(++state.position);
            }
            if (allowComments && ch === 0x23) {
                do {
                    ch = state.input.charCodeAt(++state.position);
                } while (ch !== 0x0a && ch !== 0x0d && ch !== 0);
            }
            if (isEOL(ch)) {
                readLineBreak(state);
                ch = state.input.charCodeAt(state.position);
                lineBreaks++;
                state.lineIndent = 0;
                while (ch === 0x20) {
                    state.lineIndent++;
                    ch = state.input.charCodeAt(++state.position);
                }
            }
            else {
                break;
            }
        }
        if (checkIndent !== -1 &&
            lineBreaks !== 0 &&
            state.lineIndent < checkIndent) {
            throwWarning(state, "deficient indentation");
        }
        return lineBreaks;
    }
    function testDocumentSeparator(state) {
        let _position = state.position;
        let ch = state.input.charCodeAt(_position);
        if ((ch === 0x2d || ch === 0x2e) &&
            ch === state.input.charCodeAt(_position + 1) &&
            ch === state.input.charCodeAt(_position + 2)) {
            _position += 3;
            ch = state.input.charCodeAt(_position);
            if (ch === 0 || isWsOrEol(ch)) {
                return true;
            }
        }
        return false;
    }
    function writeFoldedLines(state, count) {
        if (count === 1) {
            state.result += " ";
        }
        else if (count > 1) {
            state.result += common.repeat("\n", count - 1);
        }
    }
    function readPlainScalar(state, nodeIndent, withinFlowCollection) {
        const kind = state.kind;
        const result = state.result;
        let ch = state.input.charCodeAt(state.position);
        if (isWsOrEol(ch) ||
            isFlowIndicator(ch) ||
            ch === 0x23 ||
            ch === 0x26 ||
            ch === 0x2a ||
            ch === 0x21 ||
            ch === 0x7c ||
            ch === 0x3e ||
            ch === 0x27 ||
            ch === 0x22 ||
            ch === 0x25 ||
            ch === 0x40 ||
            ch === 0x60) {
            return false;
        }
        let following;
        if (ch === 0x3f || ch === 0x2d) {
            following = state.input.charCodeAt(state.position + 1);
            if (isWsOrEol(following) ||
                (withinFlowCollection && isFlowIndicator(following))) {
                return false;
            }
        }
        state.kind = "scalar";
        state.result = "";
        let captureEnd, captureStart = (captureEnd = state.position);
        let hasPendingContent = false;
        let line = 0;
        while (ch !== 0) {
            if (ch === 0x3a) {
                following = state.input.charCodeAt(state.position + 1);
                if (isWsOrEol(following) ||
                    (withinFlowCollection && isFlowIndicator(following))) {
                    break;
                }
            }
            else if (ch === 0x23) {
                const preceding = state.input.charCodeAt(state.position - 1);
                if (isWsOrEol(preceding)) {
                    break;
                }
            }
            else if ((state.position === state.lineStart && testDocumentSeparator(state)) ||
                (withinFlowCollection && isFlowIndicator(ch))) {
                break;
            }
            else if (isEOL(ch)) {
                line = state.line;
                const lineStart = state.lineStart;
                const lineIndent = state.lineIndent;
                skipSeparationSpace(state, false, -1);
                if (state.lineIndent >= nodeIndent) {
                    hasPendingContent = true;
                    ch = state.input.charCodeAt(state.position);
                    continue;
                }
                else {
                    state.position = captureEnd;
                    state.line = line;
                    state.lineStart = lineStart;
                    state.lineIndent = lineIndent;
                    break;
                }
            }
            if (hasPendingContent) {
                captureSegment(state, captureStart, captureEnd, false);
                writeFoldedLines(state, state.line - line);
                captureStart = captureEnd = state.position;
                hasPendingContent = false;
            }
            if (!isWhiteSpace(ch)) {
                captureEnd = state.position + 1;
            }
            ch = state.input.charCodeAt(++state.position);
        }
        captureSegment(state, captureStart, captureEnd, false);
        if (state.result) {
            return true;
        }
        state.kind = kind;
        state.result = result;
        return false;
    }
    function readSingleQuotedScalar(state, nodeIndent) {
        let ch, captureStart, captureEnd;
        ch = state.input.charCodeAt(state.position);
        if (ch !== 0x27) {
            return false;
        }
        state.kind = "scalar";
        state.result = "";
        state.position++;
        captureStart = captureEnd = state.position;
        while ((ch = state.input.charCodeAt(state.position)) !== 0) {
            if (ch === 0x27) {
                captureSegment(state, captureStart, state.position, true);
                ch = state.input.charCodeAt(++state.position);
                if (ch === 0x27) {
                    captureStart = state.position;
                    state.position++;
                    captureEnd = state.position;
                }
                else {
                    return true;
                }
            }
            else if (isEOL(ch)) {
                captureSegment(state, captureStart, captureEnd, true);
                writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
                captureStart = captureEnd = state.position;
            }
            else if (state.position === state.lineStart &&
                testDocumentSeparator(state)) {
                return throwError(state, "unexpected end of the document within a single quoted scalar");
            }
            else {
                state.position++;
                captureEnd = state.position;
            }
        }
        return throwError(state, "unexpected end of the stream within a single quoted scalar");
    }
    function readDoubleQuotedScalar(state, nodeIndent) {
        let ch = state.input.charCodeAt(state.position);
        if (ch !== 0x22) {
            return false;
        }
        state.kind = "scalar";
        state.result = "";
        state.position++;
        let captureEnd, captureStart = (captureEnd = state.position);
        let tmp;
        while ((ch = state.input.charCodeAt(state.position)) !== 0) {
            if (ch === 0x22) {
                captureSegment(state, captureStart, state.position, true);
                state.position++;
                return true;
            }
            if (ch === 0x5c) {
                captureSegment(state, captureStart, state.position, true);
                ch = state.input.charCodeAt(++state.position);
                if (isEOL(ch)) {
                    skipSeparationSpace(state, false, nodeIndent);
                }
                else if (ch < 256 && simpleEscapeCheck[ch]) {
                    state.result += simpleEscapeMap[ch];
                    state.position++;
                }
                else if ((tmp = escapedHexLen(ch)) > 0) {
                    let hexLength = tmp;
                    let hexResult = 0;
                    for (; hexLength > 0; hexLength--) {
                        ch = state.input.charCodeAt(++state.position);
                        if ((tmp = fromHexCode(ch)) >= 0) {
                            hexResult = (hexResult << 4) + tmp;
                        }
                        else {
                            return throwError(state, "expected hexadecimal character");
                        }
                    }
                    state.result += charFromCodepoint(hexResult);
                    state.position++;
                }
                else {
                    return throwError(state, "unknown escape sequence");
                }
                captureStart = captureEnd = state.position;
            }
            else if (isEOL(ch)) {
                captureSegment(state, captureStart, captureEnd, true);
                writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
                captureStart = captureEnd = state.position;
            }
            else if (state.position === state.lineStart &&
                testDocumentSeparator(state)) {
                return throwError(state, "unexpected end of the document within a double quoted scalar");
            }
            else {
                state.position++;
                captureEnd = state.position;
            }
        }
        return throwError(state, "unexpected end of the stream within a double quoted scalar");
    }
    function readFlowCollection(state, nodeIndent) {
        let ch = state.input.charCodeAt(state.position);
        let terminator;
        let isMapping = true;
        let result = {};
        if (ch === 0x5b) {
            terminator = 0x5d;
            isMapping = false;
            result = [];
        }
        else if (ch === 0x7b) {
            terminator = 0x7d;
        }
        else {
            return false;
        }
        if (state.anchor !== null &&
            typeof state.anchor != "undefined" &&
            typeof state.anchorMap != "undefined") {
            state.anchorMap[state.anchor] = result;
        }
        ch = state.input.charCodeAt(++state.position);
        const tag = state.tag, anchor = state.anchor;
        let readNext = true;
        let valueNode, keyNode, keyTag = (keyNode = valueNode = null), isExplicitPair, isPair = (isExplicitPair = false);
        let following = 0, line = 0;
        const overridableKeys = {};
        while (ch !== 0) {
            skipSeparationSpace(state, true, nodeIndent);
            ch = state.input.charCodeAt(state.position);
            if (ch === terminator) {
                state.position++;
                state.tag = tag;
                state.anchor = anchor;
                state.kind = isMapping ? "mapping" : "sequence";
                state.result = result;
                return true;
            }
            if (!readNext) {
                return throwError(state, "missed comma between flow collection entries");
            }
            keyTag = keyNode = valueNode = null;
            isPair = isExplicitPair = false;
            if (ch === 0x3f) {
                following = state.input.charCodeAt(state.position + 1);
                if (isWsOrEol(following)) {
                    isPair = isExplicitPair = true;
                    state.position++;
                    skipSeparationSpace(state, true, nodeIndent);
                }
            }
            line = state.line;
            composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
            keyTag = state.tag || null;
            keyNode = state.result;
            skipSeparationSpace(state, true, nodeIndent);
            ch = state.input.charCodeAt(state.position);
            if ((isExplicitPair || state.line === line) && ch === 0x3a) {
                isPair = true;
                ch = state.input.charCodeAt(++state.position);
                skipSeparationSpace(state, true, nodeIndent);
                composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
                valueNode = state.result;
            }
            if (isMapping) {
                storeMappingPair(state, result, overridableKeys, keyTag, keyNode, valueNode);
            }
            else if (isPair) {
                result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode));
            }
            else {
                result.push(keyNode);
            }
            skipSeparationSpace(state, true, nodeIndent);
            ch = state.input.charCodeAt(state.position);
            if (ch === 0x2c) {
                readNext = true;
                ch = state.input.charCodeAt(++state.position);
            }
            else {
                readNext = false;
            }
        }
        return throwError(state, "unexpected end of the stream within a flow collection");
    }
    function readBlockScalar(state, nodeIndent) {
        let chomping = CHOMPING_CLIP, didReadContent = false, detectedIndent = false, textIndent = nodeIndent, emptyLines = 0, atMoreIndented = false;
        let ch = state.input.charCodeAt(state.position);
        let folding = false;
        if (ch === 0x7c) {
            folding = false;
        }
        else if (ch === 0x3e) {
            folding = true;
        }
        else {
            return false;
        }
        state.kind = "scalar";
        state.result = "";
        let tmp = 0;
        while (ch !== 0) {
            ch = state.input.charCodeAt(++state.position);
            if (ch === 0x2b || ch === 0x2d) {
                if (CHOMPING_CLIP === chomping) {
                    chomping = ch === 0x2b ? CHOMPING_KEEP : CHOMPING_STRIP;
                }
                else {
                    return throwError(state, "repeat of a chomping mode identifier");
                }
            }
            else if ((tmp = fromDecimalCode(ch)) >= 0) {
                if (tmp === 0) {
                    return throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
                }
                else if (!detectedIndent) {
                    textIndent = nodeIndent + tmp - 1;
                    detectedIndent = true;
                }
                else {
                    return throwError(state, "repeat of an indentation width identifier");
                }
            }
            else {
                break;
            }
        }
        if (isWhiteSpace(ch)) {
            do {
                ch = state.input.charCodeAt(++state.position);
            } while (isWhiteSpace(ch));
            if (ch === 0x23) {
                do {
                    ch = state.input.charCodeAt(++state.position);
                } while (!isEOL(ch) && ch !== 0);
            }
        }
        while (ch !== 0) {
            readLineBreak(state);
            state.lineIndent = 0;
            ch = state.input.charCodeAt(state.position);
            while ((!detectedIndent || state.lineIndent < textIndent) &&
                ch === 0x20) {
                state.lineIndent++;
                ch = state.input.charCodeAt(++state.position);
            }
            if (!detectedIndent && state.lineIndent > textIndent) {
                textIndent = state.lineIndent;
            }
            if (isEOL(ch)) {
                emptyLines++;
                continue;
            }
            if (state.lineIndent < textIndent) {
                if (chomping === CHOMPING_KEEP) {
                    state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
                }
                else if (chomping === CHOMPING_CLIP) {
                    if (didReadContent) {
                        state.result += "\n";
                    }
                }
                break;
            }
            if (folding) {
                if (isWhiteSpace(ch)) {
                    atMoreIndented = true;
                    state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
                }
                else if (atMoreIndented) {
                    atMoreIndented = false;
                    state.result += common.repeat("\n", emptyLines + 1);
                }
                else if (emptyLines === 0) {
                    if (didReadContent) {
                        state.result += " ";
                    }
                }
                else {
                    state.result += common.repeat("\n", emptyLines);
                }
            }
            else {
                state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
            }
            didReadContent = true;
            detectedIndent = true;
            emptyLines = 0;
            const captureStart = state.position;
            while (!isEOL(ch) && ch !== 0) {
                ch = state.input.charCodeAt(++state.position);
            }
            captureSegment(state, captureStart, state.position, false);
        }
        return true;
    }
    function readBlockSequence(state, nodeIndent) {
        let line, following, detected = false, ch;
        const tag = state.tag, anchor = state.anchor, result = [];
        if (state.anchor !== null &&
            typeof state.anchor !== "undefined" &&
            typeof state.anchorMap !== "undefined") {
            state.anchorMap[state.anchor] = result;
        }
        ch = state.input.charCodeAt(state.position);
        while (ch !== 0) {
            if (ch !== 0x2d) {
                break;
            }
            following = state.input.charCodeAt(state.position + 1);
            if (!isWsOrEol(following)) {
                break;
            }
            detected = true;
            state.position++;
            if (skipSeparationSpace(state, true, -1)) {
                if (state.lineIndent <= nodeIndent) {
                    result.push(null);
                    ch = state.input.charCodeAt(state.position);
                    continue;
                }
            }
            line = state.line;
            composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
            result.push(state.result);
            skipSeparationSpace(state, true, -1);
            ch = state.input.charCodeAt(state.position);
            if ((state.line === line || state.lineIndent > nodeIndent) && ch !== 0) {
                return throwError(state, "bad indentation of a sequence entry");
            }
            else if (state.lineIndent < nodeIndent) {
                break;
            }
        }
        if (detected) {
            state.tag = tag;
            state.anchor = anchor;
            state.kind = "sequence";
            state.result = result;
            return true;
        }
        return false;
    }
    function readBlockMapping(state, nodeIndent, flowIndent) {
        const tag = state.tag, anchor = state.anchor, result = {}, overridableKeys = {};
        let following, allowCompact = false, line, pos, keyTag = null, keyNode = null, valueNode = null, atExplicitKey = false, detected = false, ch;
        if (state.anchor !== null &&
            typeof state.anchor !== "undefined" &&
            typeof state.anchorMap !== "undefined") {
            state.anchorMap[state.anchor] = result;
        }
        ch = state.input.charCodeAt(state.position);
        while (ch !== 0) {
            following = state.input.charCodeAt(state.position + 1);
            line = state.line;
            pos = state.position;
            if ((ch === 0x3f || ch === 0x3a) && isWsOrEol(following)) {
                if (ch === 0x3f) {
                    if (atExplicitKey) {
                        storeMappingPair(state, result, overridableKeys, keyTag, keyNode, null);
                        keyTag = keyNode = valueNode = null;
                    }
                    detected = true;
                    atExplicitKey = true;
                    allowCompact = true;
                }
                else if (atExplicitKey) {
                    atExplicitKey = false;
                    allowCompact = true;
                }
                else {
                    return throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
                }
                state.position += 1;
                ch = following;
            }
            else if (composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
                if (state.line === line) {
                    ch = state.input.charCodeAt(state.position);
                    while (isWhiteSpace(ch)) {
                        ch = state.input.charCodeAt(++state.position);
                    }
                    if (ch === 0x3a) {
                        ch = state.input.charCodeAt(++state.position);
                        if (!isWsOrEol(ch)) {
                            return throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
                        }
                        if (atExplicitKey) {
                            storeMappingPair(state, result, overridableKeys, keyTag, keyNode, null);
                            keyTag = keyNode = valueNode = null;
                        }
                        detected = true;
                        atExplicitKey = false;
                        allowCompact = false;
                        keyTag = state.tag;
                        keyNode = state.result;
                    }
                    else if (detected) {
                        return throwError(state, "can not read an implicit mapping pair; a colon is missed");
                    }
                    else {
                        state.tag = tag;
                        state.anchor = anchor;
                        return true;
                    }
                }
                else if (detected) {
                    return throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
                }
                else {
                    state.tag = tag;
                    state.anchor = anchor;
                    return true;
                }
            }
            else {
                break;
            }
            if (state.line === line || state.lineIndent > nodeIndent) {
                if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
                    if (atExplicitKey) {
                        keyNode = state.result;
                    }
                    else {
                        valueNode = state.result;
                    }
                }
                if (!atExplicitKey) {
                    storeMappingPair(state, result, overridableKeys, keyTag, keyNode, valueNode, line, pos);
                    keyTag = keyNode = valueNode = null;
                }
                skipSeparationSpace(state, true, -1);
                ch = state.input.charCodeAt(state.position);
            }
            if (state.lineIndent > nodeIndent && ch !== 0) {
                return throwError(state, "bad indentation of a mapping entry");
            }
            else if (state.lineIndent < nodeIndent) {
                break;
            }
        }
        if (atExplicitKey) {
            storeMappingPair(state, result, overridableKeys, keyTag, keyNode, null);
        }
        if (detected) {
            state.tag = tag;
            state.anchor = anchor;
            state.kind = "mapping";
            state.result = result;
        }
        return detected;
    }
    function readTagProperty(state) {
        let position, isVerbatim = false, isNamed = false, tagHandle = "", tagName, ch;
        ch = state.input.charCodeAt(state.position);
        if (ch !== 0x21)
            return false;
        if (state.tag !== null) {
            return throwError(state, "duplication of a tag property");
        }
        ch = state.input.charCodeAt(++state.position);
        if (ch === 0x3c) {
            isVerbatim = true;
            ch = state.input.charCodeAt(++state.position);
        }
        else if (ch === 0x21) {
            isNamed = true;
            tagHandle = "!!";
            ch = state.input.charCodeAt(++state.position);
        }
        else {
            tagHandle = "!";
        }
        position = state.position;
        if (isVerbatim) {
            do {
                ch = state.input.charCodeAt(++state.position);
            } while (ch !== 0 && ch !== 0x3e);
            if (state.position < state.length) {
                tagName = state.input.slice(position, state.position);
                ch = state.input.charCodeAt(++state.position);
            }
            else {
                return throwError(state, "unexpected end of the stream within a verbatim tag");
            }
        }
        else {
            while (ch !== 0 && !isWsOrEol(ch)) {
                if (ch === 0x21) {
                    if (!isNamed) {
                        tagHandle = state.input.slice(position - 1, state.position + 1);
                        if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
                            return throwError(state, "named tag handle cannot contain such characters");
                        }
                        isNamed = true;
                        position = state.position + 1;
                    }
                    else {
                        return throwError(state, "tag suffix cannot contain exclamation marks");
                    }
                }
                ch = state.input.charCodeAt(++state.position);
            }
            tagName = state.input.slice(position, state.position);
            if (PATTERN_FLOW_INDICATORS.test(tagName)) {
                return throwError(state, "tag suffix cannot contain flow indicator characters");
            }
        }
        if (tagName && !PATTERN_TAG_URI.test(tagName)) {
            return throwError(state, `tag name cannot contain such characters: ${tagName}`);
        }
        if (isVerbatim) {
            state.tag = tagName;
        }
        else if (typeof state.tagMap !== "undefined" &&
            _hasOwnProperty.call(state.tagMap, tagHandle)) {
            state.tag = state.tagMap[tagHandle] + tagName;
        }
        else if (tagHandle === "!") {
            state.tag = `!${tagName}`;
        }
        else if (tagHandle === "!!") {
            state.tag = `tag:yaml.org,2002:${tagName}`;
        }
        else {
            return throwError(state, `undeclared tag handle "${tagHandle}"`);
        }
        return true;
    }
    function readAnchorProperty(state) {
        let ch = state.input.charCodeAt(state.position);
        if (ch !== 0x26)
            return false;
        if (state.anchor !== null) {
            return throwError(state, "duplication of an anchor property");
        }
        ch = state.input.charCodeAt(++state.position);
        const position = state.position;
        while (ch !== 0 && !isWsOrEol(ch) && !isFlowIndicator(ch)) {
            ch = state.input.charCodeAt(++state.position);
        }
        if (state.position === position) {
            return throwError(state, "name of an anchor node must contain at least one character");
        }
        state.anchor = state.input.slice(position, state.position);
        return true;
    }
    function readAlias(state) {
        let ch = state.input.charCodeAt(state.position);
        if (ch !== 0x2a)
            return false;
        ch = state.input.charCodeAt(++state.position);
        const _position = state.position;
        while (ch !== 0 && !isWsOrEol(ch) && !isFlowIndicator(ch)) {
            ch = state.input.charCodeAt(++state.position);
        }
        if (state.position === _position) {
            return throwError(state, "name of an alias node must contain at least one character");
        }
        const alias = state.input.slice(_position, state.position);
        if (typeof state.anchorMap !== "undefined" &&
            !Object.prototype.hasOwnProperty.call(state.anchorMap, alias)) {
            return throwError(state, `unidentified alias "${alias}"`);
        }
        if (typeof state.anchorMap !== "undefined") {
            state.result = state.anchorMap[alias];
        }
        skipSeparationSpace(state, true, -1);
        return true;
    }
    function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
        let allowBlockScalars, allowBlockCollections, indentStatus = 1, atNewLine = false, hasContent = false, type, flowIndent, blockIndent;
        if (state.listener && state.listener !== null) {
            state.listener("open", state);
        }
        state.tag = null;
        state.anchor = null;
        state.kind = null;
        state.result = null;
        const allowBlockStyles = (allowBlockScalars = allowBlockCollections =
            CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext);
        if (allowToSeek) {
            if (skipSeparationSpace(state, true, -1)) {
                atNewLine = true;
                if (state.lineIndent > parentIndent) {
                    indentStatus = 1;
                }
                else if (state.lineIndent === parentIndent) {
                    indentStatus = 0;
                }
                else if (state.lineIndent < parentIndent) {
                    indentStatus = -1;
                }
            }
        }
        if (indentStatus === 1) {
            while (readTagProperty(state) || readAnchorProperty(state)) {
                if (skipSeparationSpace(state, true, -1)) {
                    atNewLine = true;
                    allowBlockCollections = allowBlockStyles;
                    if (state.lineIndent > parentIndent) {
                        indentStatus = 1;
                    }
                    else if (state.lineIndent === parentIndent) {
                        indentStatus = 0;
                    }
                    else if (state.lineIndent < parentIndent) {
                        indentStatus = -1;
                    }
                }
                else {
                    allowBlockCollections = false;
                }
            }
        }
        if (allowBlockCollections) {
            allowBlockCollections = atNewLine || allowCompact;
        }
        if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
            const cond = CONTEXT_FLOW_IN === nodeContext ||
                CONTEXT_FLOW_OUT === nodeContext;
            flowIndent = cond ? parentIndent : parentIndent + 1;
            blockIndent = state.position - state.lineStart;
            if (indentStatus === 1) {
                if ((allowBlockCollections &&
                    (readBlockSequence(state, blockIndent) ||
                        readBlockMapping(state, blockIndent, flowIndent))) ||
                    readFlowCollection(state, flowIndent)) {
                    hasContent = true;
                }
                else {
                    if ((allowBlockScalars && readBlockScalar(state, flowIndent)) ||
                        readSingleQuotedScalar(state, flowIndent) ||
                        readDoubleQuotedScalar(state, flowIndent)) {
                        hasContent = true;
                    }
                    else if (readAlias(state)) {
                        hasContent = true;
                        if (state.tag !== null || state.anchor !== null) {
                            return throwError(state, "alias node should not have Any properties");
                        }
                    }
                    else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
                        hasContent = true;
                        if (state.tag === null) {
                            state.tag = "?";
                        }
                    }
                    if (state.anchor !== null && typeof state.anchorMap !== "undefined") {
                        state.anchorMap[state.anchor] = state.result;
                    }
                }
            }
            else if (indentStatus === 0) {
                hasContent = allowBlockCollections &&
                    readBlockSequence(state, blockIndent);
            }
        }
        if (state.tag !== null && state.tag !== "!") {
            if (state.tag === "?") {
                for (let typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex++) {
                    type = state.implicitTypes[typeIndex];
                    if (type.resolve(state.result)) {
                        state.result = type.construct(state.result);
                        state.tag = type.tag;
                        if (state.anchor !== null && typeof state.anchorMap !== "undefined") {
                            state.anchorMap[state.anchor] = state.result;
                        }
                        break;
                    }
                }
            }
            else if (_hasOwnProperty.call(state.typeMap[state.kind || "fallback"], state.tag)) {
                type = state.typeMap[state.kind || "fallback"][state.tag];
                if (state.result !== null && type.kind !== state.kind) {
                    return throwError(state, `unacceptable node kind for !<${state.tag}> tag; it should be "${type.kind}", not "${state.kind}"`);
                }
                if (!type.resolve(state.result)) {
                    return throwError(state, `cannot resolve a node with !<${state.tag}> explicit tag`);
                }
                else {
                    state.result = type.construct(state.result);
                    if (state.anchor !== null && typeof state.anchorMap !== "undefined") {
                        state.anchorMap[state.anchor] = state.result;
                    }
                }
            }
            else {
                return throwError(state, `unknown tag !<${state.tag}>`);
            }
        }
        if (state.listener && state.listener !== null) {
            state.listener("close", state);
        }
        return state.tag !== null || state.anchor !== null || hasContent;
    }
    function readDocument(state) {
        const documentStart = state.position;
        let position, directiveName, directiveArgs, hasDirectives = false, ch;
        state.version = null;
        state.checkLineBreaks = state.legacy;
        state.tagMap = {};
        state.anchorMap = {};
        while ((ch = state.input.charCodeAt(state.position)) !== 0) {
            skipSeparationSpace(state, true, -1);
            ch = state.input.charCodeAt(state.position);
            if (state.lineIndent > 0 || ch !== 0x25) {
                break;
            }
            hasDirectives = true;
            ch = state.input.charCodeAt(++state.position);
            position = state.position;
            while (ch !== 0 && !isWsOrEol(ch)) {
                ch = state.input.charCodeAt(++state.position);
            }
            directiveName = state.input.slice(position, state.position);
            directiveArgs = [];
            if (directiveName.length < 1) {
                return throwError(state, "directive name must not be less than one character in length");
            }
            while (ch !== 0) {
                while (isWhiteSpace(ch)) {
                    ch = state.input.charCodeAt(++state.position);
                }
                if (ch === 0x23) {
                    do {
                        ch = state.input.charCodeAt(++state.position);
                    } while (ch !== 0 && !isEOL(ch));
                    break;
                }
                if (isEOL(ch))
                    break;
                position = state.position;
                while (ch !== 0 && !isWsOrEol(ch)) {
                    ch = state.input.charCodeAt(++state.position);
                }
                directiveArgs.push(state.input.slice(position, state.position));
            }
            if (ch !== 0)
                readLineBreak(state);
            if (_hasOwnProperty.call(directiveHandlers, directiveName)) {
                directiveHandlers[directiveName](state, directiveName, ...directiveArgs);
            }
            else {
                throwWarning(state, `unknown document directive "${directiveName}"`);
            }
        }
        skipSeparationSpace(state, true, -1);
        if (state.lineIndent === 0 &&
            state.input.charCodeAt(state.position) === 0x2d &&
            state.input.charCodeAt(state.position + 1) === 0x2d &&
            state.input.charCodeAt(state.position + 2) === 0x2d) {
            state.position += 3;
            skipSeparationSpace(state, true, -1);
        }
        else if (hasDirectives) {
            return throwError(state, "directives end mark is expected");
        }
        composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
        skipSeparationSpace(state, true, -1);
        if (state.checkLineBreaks &&
            PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
            throwWarning(state, "non-ASCII line breaks are interpreted as content");
        }
        state.documents.push(state.result);
        if (state.position === state.lineStart && testDocumentSeparator(state)) {
            if (state.input.charCodeAt(state.position) === 0x2e) {
                state.position += 3;
                skipSeparationSpace(state, true, -1);
            }
            return;
        }
        if (state.position < state.length - 1) {
            return throwError(state, "end of the stream or a document separator is expected");
        }
        else {
            return;
        }
    }
    function loadDocuments(input, options) {
        input = String(input);
        options = options || {};
        if (input.length !== 0) {
            if (input.charCodeAt(input.length - 1) !== 0x0a &&
                input.charCodeAt(input.length - 1) !== 0x0d) {
                input += "\n";
            }
            if (input.charCodeAt(0) === 0xfeff) {
                input = input.slice(1);
            }
        }
        const state = new loader_state_ts_1.LoaderState(input, options);
        state.input += "\0";
        while (state.input.charCodeAt(state.position) === 0x20) {
            state.lineIndent += 1;
            state.position += 1;
        }
        while (state.position < state.length - 1) {
            readDocument(state);
        }
        return state.documents;
    }
    function isCbFunction(fn) {
        return typeof fn === "function";
    }
    function loadAll(input, iteratorOrOption, options) {
        if (!isCbFunction(iteratorOrOption)) {
            return loadDocuments(input, iteratorOrOption);
        }
        const documents = loadDocuments(input, options);
        const iterator = iteratorOrOption;
        for (let index = 0, length = documents.length; index < length; index++) {
            iterator(documents[index]);
        }
        return void 0;
    }
    exports_27("loadAll", loadAll);
    function load(input, options) {
        const documents = loadDocuments(input, options);
        if (documents.length === 0) {
            return;
        }
        if (documents.length === 1) {
            return documents[0];
        }
        throw new error_ts_2.YAMLError("expected a single document in the stream, but found more");
    }
    exports_27("load", load);
    return {
        setters: [
            function (error_ts_2_1) {
                error_ts_2 = error_ts_2_1;
            },
            function (mark_ts_1_1) {
                mark_ts_1 = mark_ts_1_1;
            },
            function (common_1) {
                common = common_1;
            },
            function (loader_state_ts_1_1) {
                loader_state_ts_1 = loader_state_ts_1_1;
            }
        ],
        execute: function () {
            _hasOwnProperty = Object.prototype.hasOwnProperty;
            CONTEXT_FLOW_IN = 1;
            CONTEXT_FLOW_OUT = 2;
            CONTEXT_BLOCK_IN = 3;
            CONTEXT_BLOCK_OUT = 4;
            CHOMPING_CLIP = 1;
            CHOMPING_STRIP = 2;
            CHOMPING_KEEP = 3;
            PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
            PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
            PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
            PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
            PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
            simpleEscapeCheck = new Array(256);
            simpleEscapeMap = new Array(256);
            for (let i = 0; i < 256; i++) {
                simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
                simpleEscapeMap[i] = simpleEscapeSequence(i);
            }
            directiveHandlers = {
                YAML(state, _name, ...args) {
                    if (state.version !== null) {
                        return throwError(state, "duplication of %YAML directive");
                    }
                    if (args.length !== 1) {
                        return throwError(state, "YAML directive accepts exactly one argument");
                    }
                    const match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
                    if (match === null) {
                        return throwError(state, "ill-formed argument of the YAML directive");
                    }
                    const major = parseInt(match[1], 10);
                    const minor = parseInt(match[2], 10);
                    if (major !== 1) {
                        return throwError(state, "unacceptable YAML version of the document");
                    }
                    state.version = args[0];
                    state.checkLineBreaks = minor < 2;
                    if (minor !== 1 && minor !== 2) {
                        return throwWarning(state, "unsupported YAML version of the document");
                    }
                },
                TAG(state, _name, ...args) {
                    if (args.length !== 2) {
                        return throwError(state, "TAG directive accepts exactly two arguments");
                    }
                    const handle = args[0];
                    const prefix = args[1];
                    if (!PATTERN_TAG_HANDLE.test(handle)) {
                        return throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
                    }
                    if (_hasOwnProperty.call(state.tagMap, handle)) {
                        return throwError(state, `there is a previously declared suffix for "${handle}" tag handle`);
                    }
                    if (!PATTERN_TAG_URI.test(prefix)) {
                        return throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
                    }
                    if (typeof state.tagMap === "undefined") {
                        state.tagMap = {};
                    }
                    state.tagMap[handle] = prefix;
                },
            };
        }
    };
});
System.register("https://deno.land/std@0.65.0/encoding/_yaml/parse", ["https://deno.land/std@0.65.0/encoding/_yaml/loader/loader"], function (exports_28, context_28) {
    "use strict";
    var loader_ts_1;
    var __moduleName = context_28 && context_28.id;
    function parse(content, options) {
        return loader_ts_1.load(content, options);
    }
    exports_28("parse", parse);
    function parseAll(content, iterator, options) {
        return loader_ts_1.loadAll(content, iterator, options);
    }
    exports_28("parseAll", parseAll);
    return {
        setters: [
            function (loader_ts_1_1) {
                loader_ts_1 = loader_ts_1_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/std@0.65.0/encoding/_yaml/dumper/dumper_state", ["https://deno.land/std@0.65.0/encoding/_yaml/state"], function (exports_29, context_29) {
    "use strict";
    var state_ts_2, _hasOwnProperty, DumperState;
    var __moduleName = context_29 && context_29.id;
    function compileStyleMap(schema, map) {
        if (typeof map === "undefined" || map === null)
            return {};
        let type;
        const result = {};
        const keys = Object.keys(map);
        let tag, style;
        for (let index = 0, length = keys.length; index < length; index += 1) {
            tag = keys[index];
            style = String(map[tag]);
            if (tag.slice(0, 2) === "!!") {
                tag = `tag:yaml.org,2002:${tag.slice(2)}`;
            }
            type = schema.compiledTypeMap.fallback[tag];
            if (type &&
                typeof type.styleAliases !== "undefined" &&
                _hasOwnProperty.call(type.styleAliases, style)) {
                style = type.styleAliases[style];
            }
            result[tag] = style;
        }
        return result;
    }
    return {
        setters: [
            function (state_ts_2_1) {
                state_ts_2 = state_ts_2_1;
            }
        ],
        execute: function () {
            _hasOwnProperty = Object.prototype.hasOwnProperty;
            DumperState = class DumperState extends state_ts_2.State {
                constructor({ schema, indent = 2, noArrayIndent = false, skipInvalid = false, flowLevel = -1, styles = null, sortKeys = false, lineWidth = 80, noRefs = false, noCompatMode = false, condenseFlow = false, }) {
                    super(schema);
                    this.tag = null;
                    this.result = "";
                    this.duplicates = [];
                    this.usedDuplicates = [];
                    this.indent = Math.max(1, indent);
                    this.noArrayIndent = noArrayIndent;
                    this.skipInvalid = skipInvalid;
                    this.flowLevel = flowLevel;
                    this.styleMap = compileStyleMap(this.schema, styles);
                    this.sortKeys = sortKeys;
                    this.lineWidth = lineWidth;
                    this.noRefs = noRefs;
                    this.noCompatMode = noCompatMode;
                    this.condenseFlow = condenseFlow;
                    this.implicitTypes = this.schema.compiledImplicit;
                    this.explicitTypes = this.schema.compiledExplicit;
                }
            };
            exports_29("DumperState", DumperState);
        }
    };
});
System.register("https://deno.land/std@0.65.0/encoding/_yaml/dumper/dumper", ["https://deno.land/std@0.65.0/encoding/_yaml/error", "https://deno.land/std@0.65.0/encoding/_yaml/utils", "https://deno.land/std@0.65.0/encoding/_yaml/dumper/dumper_state"], function (exports_30, context_30) {
    "use strict";
    var error_ts_3, common, dumper_state_ts_1, _toString, _hasOwnProperty, CHAR_TAB, CHAR_LINE_FEED, CHAR_SPACE, CHAR_EXCLAMATION, CHAR_DOUBLE_QUOTE, CHAR_SHARP, CHAR_PERCENT, CHAR_AMPERSAND, CHAR_SINGLE_QUOTE, CHAR_ASTERISK, CHAR_COMMA, CHAR_MINUS, CHAR_COLON, CHAR_GREATER_THAN, CHAR_QUESTION, CHAR_COMMERCIAL_AT, CHAR_LEFT_SQUARE_BRACKET, CHAR_RIGHT_SQUARE_BRACKET, CHAR_GRAVE_ACCENT, CHAR_LEFT_CURLY_BRACKET, CHAR_VERTICAL_LINE, CHAR_RIGHT_CURLY_BRACKET, ESCAPE_SEQUENCES, DEPRECATED_BOOLEANS_SYNTAX, STYLE_PLAIN, STYLE_SINGLE, STYLE_LITERAL, STYLE_FOLDED, STYLE_DOUBLE;
    var __moduleName = context_30 && context_30.id;
    function encodeHex(character) {
        const string = character.toString(16).toUpperCase();
        let handle;
        let length;
        if (character <= 0xff) {
            handle = "x";
            length = 2;
        }
        else if (character <= 0xffff) {
            handle = "u";
            length = 4;
        }
        else if (character <= 0xffffffff) {
            handle = "U";
            length = 8;
        }
        else {
            throw new error_ts_3.YAMLError("code point within a string may not be greater than 0xFFFFFFFF");
        }
        return `\\${handle}${common.repeat("0", length - string.length)}${string}`;
    }
    function indentString(string, spaces) {
        const ind = common.repeat(" ", spaces), length = string.length;
        let position = 0, next = -1, result = "", line;
        while (position < length) {
            next = string.indexOf("\n", position);
            if (next === -1) {
                line = string.slice(position);
                position = length;
            }
            else {
                line = string.slice(position, next + 1);
                position = next + 1;
            }
            if (line.length && line !== "\n")
                result += ind;
            result += line;
        }
        return result;
    }
    function generateNextLine(state, level) {
        return `\n${common.repeat(" ", state.indent * level)}`;
    }
    function testImplicitResolving(state, str) {
        let type;
        for (let index = 0, length = state.implicitTypes.length; index < length; index += 1) {
            type = state.implicitTypes[index];
            if (type.resolve(str)) {
                return true;
            }
        }
        return false;
    }
    function isWhitespace(c) {
        return c === CHAR_SPACE || c === CHAR_TAB;
    }
    function isPrintable(c) {
        return ((0x00020 <= c && c <= 0x00007e) ||
            (0x000a1 <= c && c <= 0x00d7ff && c !== 0x2028 && c !== 0x2029) ||
            (0x0e000 <= c && c <= 0x00fffd && c !== 0xfeff) ||
            (0x10000 <= c && c <= 0x10ffff));
    }
    function isPlainSafe(c) {
        return (isPrintable(c) &&
            c !== 0xfeff &&
            c !== CHAR_COMMA &&
            c !== CHAR_LEFT_SQUARE_BRACKET &&
            c !== CHAR_RIGHT_SQUARE_BRACKET &&
            c !== CHAR_LEFT_CURLY_BRACKET &&
            c !== CHAR_RIGHT_CURLY_BRACKET &&
            c !== CHAR_COLON &&
            c !== CHAR_SHARP);
    }
    function isPlainSafeFirst(c) {
        return (isPrintable(c) &&
            c !== 0xfeff &&
            !isWhitespace(c) &&
            c !== CHAR_MINUS &&
            c !== CHAR_QUESTION &&
            c !== CHAR_COLON &&
            c !== CHAR_COMMA &&
            c !== CHAR_LEFT_SQUARE_BRACKET &&
            c !== CHAR_RIGHT_SQUARE_BRACKET &&
            c !== CHAR_LEFT_CURLY_BRACKET &&
            c !== CHAR_RIGHT_CURLY_BRACKET &&
            c !== CHAR_SHARP &&
            c !== CHAR_AMPERSAND &&
            c !== CHAR_ASTERISK &&
            c !== CHAR_EXCLAMATION &&
            c !== CHAR_VERTICAL_LINE &&
            c !== CHAR_GREATER_THAN &&
            c !== CHAR_SINGLE_QUOTE &&
            c !== CHAR_DOUBLE_QUOTE &&
            c !== CHAR_PERCENT &&
            c !== CHAR_COMMERCIAL_AT &&
            c !== CHAR_GRAVE_ACCENT);
    }
    function needIndentIndicator(string) {
        const leadingSpaceRe = /^\n* /;
        return leadingSpaceRe.test(string);
    }
    function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType) {
        const shouldTrackWidth = lineWidth !== -1;
        let hasLineBreak = false, hasFoldableLine = false, previousLineBreak = -1, plain = isPlainSafeFirst(string.charCodeAt(0)) &&
            !isWhitespace(string.charCodeAt(string.length - 1));
        let char, i;
        if (singleLineOnly) {
            for (i = 0; i < string.length; i++) {
                char = string.charCodeAt(i);
                if (!isPrintable(char)) {
                    return STYLE_DOUBLE;
                }
                plain = plain && isPlainSafe(char);
            }
        }
        else {
            for (i = 0; i < string.length; i++) {
                char = string.charCodeAt(i);
                if (char === CHAR_LINE_FEED) {
                    hasLineBreak = true;
                    if (shouldTrackWidth) {
                        hasFoldableLine = hasFoldableLine ||
                            (i - previousLineBreak - 1 > lineWidth &&
                                string[previousLineBreak + 1] !== " ");
                        previousLineBreak = i;
                    }
                }
                else if (!isPrintable(char)) {
                    return STYLE_DOUBLE;
                }
                plain = plain && isPlainSafe(char);
            }
            hasFoldableLine = hasFoldableLine ||
                (shouldTrackWidth &&
                    i - previousLineBreak - 1 > lineWidth &&
                    string[previousLineBreak + 1] !== " ");
        }
        if (!hasLineBreak && !hasFoldableLine) {
            return plain && !testAmbiguousType(string) ? STYLE_PLAIN : STYLE_SINGLE;
        }
        if (indentPerLevel > 9 && needIndentIndicator(string)) {
            return STYLE_DOUBLE;
        }
        return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
    }
    function foldLine(line, width) {
        if (line === "" || line[0] === " ")
            return line;
        const breakRe = / [^ ]/g;
        let match;
        let start = 0, end, curr = 0, next = 0;
        let result = "";
        while ((match = breakRe.exec(line))) {
            next = match.index;
            if (next - start > width) {
                end = curr > start ? curr : next;
                result += `\n${line.slice(start, end)}`;
                start = end + 1;
            }
            curr = next;
        }
        result += "\n";
        if (line.length - start > width && curr > start) {
            result += `${line.slice(start, curr)}\n${line.slice(curr + 1)}`;
        }
        else {
            result += line.slice(start);
        }
        return result.slice(1);
    }
    function dropEndingNewline(string) {
        return string[string.length - 1] === "\n" ? string.slice(0, -1) : string;
    }
    function foldString(string, width) {
        const lineRe = /(\n+)([^\n]*)/g;
        let result = (() => {
            let nextLF = string.indexOf("\n");
            nextLF = nextLF !== -1 ? nextLF : string.length;
            lineRe.lastIndex = nextLF;
            return foldLine(string.slice(0, nextLF), width);
        })();
        let prevMoreIndented = string[0] === "\n" || string[0] === " ";
        let moreIndented;
        let match;
        while ((match = lineRe.exec(string))) {
            const prefix = match[1], line = match[2];
            moreIndented = line[0] === " ";
            result += prefix +
                (!prevMoreIndented && !moreIndented && line !== "" ? "\n" : "") +
                foldLine(line, width);
            prevMoreIndented = moreIndented;
        }
        return result;
    }
    function escapeString(string) {
        let result = "";
        let char, nextChar;
        let escapeSeq;
        for (let i = 0; i < string.length; i++) {
            char = string.charCodeAt(i);
            if (char >= 0xd800 && char <= 0xdbff) {
                nextChar = string.charCodeAt(i + 1);
                if (nextChar >= 0xdc00 && nextChar <= 0xdfff) {
                    result += encodeHex((char - 0xd800) * 0x400 + nextChar - 0xdc00 + 0x10000);
                    i++;
                    continue;
                }
            }
            escapeSeq = ESCAPE_SEQUENCES[char];
            result += !escapeSeq && isPrintable(char)
                ? string[i]
                : escapeSeq || encodeHex(char);
        }
        return result;
    }
    function blockHeader(string, indentPerLevel) {
        const indentIndicator = needIndentIndicator(string)
            ? String(indentPerLevel)
            : "";
        const clip = string[string.length - 1] === "\n";
        const keep = clip && (string[string.length - 2] === "\n" || string === "\n");
        const chomp = keep ? "+" : clip ? "" : "-";
        return `${indentIndicator}${chomp}\n`;
    }
    function writeScalar(state, string, level, iskey) {
        state.dump = (() => {
            if (string.length === 0) {
                return "''";
            }
            if (!state.noCompatMode &&
                DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1) {
                return `'${string}'`;
            }
            const indent = state.indent * Math.max(1, level);
            const lineWidth = state.lineWidth === -1
                ? -1
                : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
            const singleLineOnly = iskey ||
                (state.flowLevel > -1 && level >= state.flowLevel);
            function testAmbiguity(str) {
                return testImplicitResolving(state, str);
            }
            switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth, testAmbiguity)) {
                case STYLE_PLAIN:
                    return string;
                case STYLE_SINGLE:
                    return `'${string.replace(/'/g, "''")}'`;
                case STYLE_LITERAL:
                    return `|${blockHeader(string, state.indent)}${dropEndingNewline(indentString(string, indent))}`;
                case STYLE_FOLDED:
                    return `>${blockHeader(string, state.indent)}${dropEndingNewline(indentString(foldString(string, lineWidth), indent))}`;
                case STYLE_DOUBLE:
                    return `"${escapeString(string)}"`;
                default:
                    throw new error_ts_3.YAMLError("impossible error: invalid scalar style");
            }
        })();
    }
    function writeFlowSequence(state, level, object) {
        let _result = "";
        const _tag = state.tag;
        for (let index = 0, length = object.length; index < length; index += 1) {
            if (writeNode(state, level, object[index], false, false)) {
                if (index !== 0)
                    _result += `,${!state.condenseFlow ? " " : ""}`;
                _result += state.dump;
            }
        }
        state.tag = _tag;
        state.dump = `[${_result}]`;
    }
    function writeBlockSequence(state, level, object, compact = false) {
        let _result = "";
        const _tag = state.tag;
        for (let index = 0, length = object.length; index < length; index += 1) {
            if (writeNode(state, level + 1, object[index], true, true)) {
                if (!compact || index !== 0) {
                    _result += generateNextLine(state, level);
                }
                if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
                    _result += "-";
                }
                else {
                    _result += "- ";
                }
                _result += state.dump;
            }
        }
        state.tag = _tag;
        state.dump = _result || "[]";
    }
    function writeFlowMapping(state, level, object) {
        let _result = "";
        const _tag = state.tag, objectKeyList = Object.keys(object);
        let pairBuffer, objectKey, objectValue;
        for (let index = 0, length = objectKeyList.length; index < length; index += 1) {
            pairBuffer = state.condenseFlow ? '"' : "";
            if (index !== 0)
                pairBuffer += ", ";
            objectKey = objectKeyList[index];
            objectValue = object[objectKey];
            if (!writeNode(state, level, objectKey, false, false)) {
                continue;
            }
            if (state.dump.length > 1024)
                pairBuffer += "? ";
            pairBuffer += `${state.dump}${state.condenseFlow ? '"' : ""}:${state.condenseFlow ? "" : " "}`;
            if (!writeNode(state, level, objectValue, false, false)) {
                continue;
            }
            pairBuffer += state.dump;
            _result += pairBuffer;
        }
        state.tag = _tag;
        state.dump = `{${_result}}`;
    }
    function writeBlockMapping(state, level, object, compact = false) {
        const _tag = state.tag, objectKeyList = Object.keys(object);
        let _result = "";
        if (state.sortKeys === true) {
            objectKeyList.sort();
        }
        else if (typeof state.sortKeys === "function") {
            objectKeyList.sort(state.sortKeys);
        }
        else if (state.sortKeys) {
            throw new error_ts_3.YAMLError("sortKeys must be a boolean or a function");
        }
        let pairBuffer = "", objectKey, objectValue, explicitPair;
        for (let index = 0, length = objectKeyList.length; index < length; index += 1) {
            pairBuffer = "";
            if (!compact || index !== 0) {
                pairBuffer += generateNextLine(state, level);
            }
            objectKey = objectKeyList[index];
            objectValue = object[objectKey];
            if (!writeNode(state, level + 1, objectKey, true, true, true)) {
                continue;
            }
            explicitPair = (state.tag !== null && state.tag !== "?") ||
                (state.dump && state.dump.length > 1024);
            if (explicitPair) {
                if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
                    pairBuffer += "?";
                }
                else {
                    pairBuffer += "? ";
                }
            }
            pairBuffer += state.dump;
            if (explicitPair) {
                pairBuffer += generateNextLine(state, level);
            }
            if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
                continue;
            }
            if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
                pairBuffer += ":";
            }
            else {
                pairBuffer += ": ";
            }
            pairBuffer += state.dump;
            _result += pairBuffer;
        }
        state.tag = _tag;
        state.dump = _result || "{}";
    }
    function detectType(state, object, explicit = false) {
        const typeList = explicit ? state.explicitTypes : state.implicitTypes;
        let type;
        let style;
        let _result;
        for (let index = 0, length = typeList.length; index < length; index += 1) {
            type = typeList[index];
            if ((type.instanceOf || type.predicate) &&
                (!type.instanceOf ||
                    (typeof object === "object" && object instanceof type.instanceOf)) &&
                (!type.predicate || type.predicate(object))) {
                state.tag = explicit ? type.tag : "?";
                if (type.represent) {
                    style = state.styleMap[type.tag] || type.defaultStyle;
                    if (_toString.call(type.represent) === "[object Function]") {
                        _result = type.represent(object, style);
                    }
                    else if (_hasOwnProperty.call(type.represent, style)) {
                        _result = type.represent[style](object, style);
                    }
                    else {
                        throw new error_ts_3.YAMLError(`!<${type.tag}> tag resolver accepts not "${style}" style`);
                    }
                    state.dump = _result;
                }
                return true;
            }
        }
        return false;
    }
    function writeNode(state, level, object, block, compact, iskey = false) {
        state.tag = null;
        state.dump = object;
        if (!detectType(state, object, false)) {
            detectType(state, object, true);
        }
        const type = _toString.call(state.dump);
        if (block) {
            block = state.flowLevel < 0 || state.flowLevel > level;
        }
        const objectOrArray = type === "[object Object]" || type === "[object Array]";
        let duplicateIndex = -1;
        let duplicate = false;
        if (objectOrArray) {
            duplicateIndex = state.duplicates.indexOf(object);
            duplicate = duplicateIndex !== -1;
        }
        if ((state.tag !== null && state.tag !== "?") ||
            duplicate ||
            (state.indent !== 2 && level > 0)) {
            compact = false;
        }
        if (duplicate && state.usedDuplicates[duplicateIndex]) {
            state.dump = `*ref_${duplicateIndex}`;
        }
        else {
            if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
                state.usedDuplicates[duplicateIndex] = true;
            }
            if (type === "[object Object]") {
                if (block && Object.keys(state.dump).length !== 0) {
                    writeBlockMapping(state, level, state.dump, compact);
                    if (duplicate) {
                        state.dump = `&ref_${duplicateIndex}${state.dump}`;
                    }
                }
                else {
                    writeFlowMapping(state, level, state.dump);
                    if (duplicate) {
                        state.dump = `&ref_${duplicateIndex} ${state.dump}`;
                    }
                }
            }
            else if (type === "[object Array]") {
                const arrayLevel = state.noArrayIndent && level > 0 ? level - 1 : level;
                if (block && state.dump.length !== 0) {
                    writeBlockSequence(state, arrayLevel, state.dump, compact);
                    if (duplicate) {
                        state.dump = `&ref_${duplicateIndex}${state.dump}`;
                    }
                }
                else {
                    writeFlowSequence(state, arrayLevel, state.dump);
                    if (duplicate) {
                        state.dump = `&ref_${duplicateIndex} ${state.dump}`;
                    }
                }
            }
            else if (type === "[object String]") {
                if (state.tag !== "?") {
                    writeScalar(state, state.dump, level, iskey);
                }
            }
            else {
                if (state.skipInvalid)
                    return false;
                throw new error_ts_3.YAMLError(`unacceptable kind of an object to dump ${type}`);
            }
            if (state.tag !== null && state.tag !== "?") {
                state.dump = `!<${state.tag}> ${state.dump}`;
            }
        }
        return true;
    }
    function inspectNode(object, objects, duplicatesIndexes) {
        if (object !== null && typeof object === "object") {
            const index = objects.indexOf(object);
            if (index !== -1) {
                if (duplicatesIndexes.indexOf(index) === -1) {
                    duplicatesIndexes.push(index);
                }
            }
            else {
                objects.push(object);
                if (Array.isArray(object)) {
                    for (let idx = 0, length = object.length; idx < length; idx += 1) {
                        inspectNode(object[idx], objects, duplicatesIndexes);
                    }
                }
                else {
                    const objectKeyList = Object.keys(object);
                    for (let idx = 0, length = objectKeyList.length; idx < length; idx += 1) {
                        inspectNode(object[objectKeyList[idx]], objects, duplicatesIndexes);
                    }
                }
            }
        }
    }
    function getDuplicateReferences(object, state) {
        const objects = [], duplicatesIndexes = [];
        inspectNode(object, objects, duplicatesIndexes);
        const length = duplicatesIndexes.length;
        for (let index = 0; index < length; index += 1) {
            state.duplicates.push(objects[duplicatesIndexes[index]]);
        }
        state.usedDuplicates = new Array(length);
    }
    function dump(input, options) {
        options = options || {};
        const state = new dumper_state_ts_1.DumperState(options);
        if (!state.noRefs)
            getDuplicateReferences(input, state);
        if (writeNode(state, 0, input, true, true))
            return `${state.dump}\n`;
        return "";
    }
    exports_30("dump", dump);
    return {
        setters: [
            function (error_ts_3_1) {
                error_ts_3 = error_ts_3_1;
            },
            function (common_2) {
                common = common_2;
            },
            function (dumper_state_ts_1_1) {
                dumper_state_ts_1 = dumper_state_ts_1_1;
            }
        ],
        execute: function () {
            _toString = Object.prototype.toString;
            _hasOwnProperty = Object.prototype.hasOwnProperty;
            CHAR_TAB = 0x09;
            CHAR_LINE_FEED = 0x0a;
            CHAR_SPACE = 0x20;
            CHAR_EXCLAMATION = 0x21;
            CHAR_DOUBLE_QUOTE = 0x22;
            CHAR_SHARP = 0x23;
            CHAR_PERCENT = 0x25;
            CHAR_AMPERSAND = 0x26;
            CHAR_SINGLE_QUOTE = 0x27;
            CHAR_ASTERISK = 0x2a;
            CHAR_COMMA = 0x2c;
            CHAR_MINUS = 0x2d;
            CHAR_COLON = 0x3a;
            CHAR_GREATER_THAN = 0x3e;
            CHAR_QUESTION = 0x3f;
            CHAR_COMMERCIAL_AT = 0x40;
            CHAR_LEFT_SQUARE_BRACKET = 0x5b;
            CHAR_RIGHT_SQUARE_BRACKET = 0x5d;
            CHAR_GRAVE_ACCENT = 0x60;
            CHAR_LEFT_CURLY_BRACKET = 0x7b;
            CHAR_VERTICAL_LINE = 0x7c;
            CHAR_RIGHT_CURLY_BRACKET = 0x7d;
            ESCAPE_SEQUENCES = {};
            ESCAPE_SEQUENCES[0x00] = "\\0";
            ESCAPE_SEQUENCES[0x07] = "\\a";
            ESCAPE_SEQUENCES[0x08] = "\\b";
            ESCAPE_SEQUENCES[0x09] = "\\t";
            ESCAPE_SEQUENCES[0x0a] = "\\n";
            ESCAPE_SEQUENCES[0x0b] = "\\v";
            ESCAPE_SEQUENCES[0x0c] = "\\f";
            ESCAPE_SEQUENCES[0x0d] = "\\r";
            ESCAPE_SEQUENCES[0x1b] = "\\e";
            ESCAPE_SEQUENCES[0x22] = '\\"';
            ESCAPE_SEQUENCES[0x5c] = "\\\\";
            ESCAPE_SEQUENCES[0x85] = "\\N";
            ESCAPE_SEQUENCES[0xa0] = "\\_";
            ESCAPE_SEQUENCES[0x2028] = "\\L";
            ESCAPE_SEQUENCES[0x2029] = "\\P";
            DEPRECATED_BOOLEANS_SYNTAX = [
                "y",
                "Y",
                "yes",
                "Yes",
                "YES",
                "on",
                "On",
                "ON",
                "n",
                "N",
                "no",
                "No",
                "NO",
                "off",
                "Off",
                "OFF",
            ];
            STYLE_PLAIN = 1, STYLE_SINGLE = 2, STYLE_LITERAL = 3, STYLE_FOLDED = 4, STYLE_DOUBLE = 5;
        }
    };
});
System.register("https://deno.land/std@0.65.0/encoding/_yaml/stringify", ["https://deno.land/std@0.65.0/encoding/_yaml/dumper/dumper"], function (exports_31, context_31) {
    "use strict";
    var dumper_ts_1;
    var __moduleName = context_31 && context_31.id;
    function stringify(obj, options) {
        return dumper_ts_1.dump(obj, options);
    }
    exports_31("stringify", stringify);
    return {
        setters: [
            function (dumper_ts_1_1) {
                dumper_ts_1 = dumper_ts_1_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/std@0.65.0/encoding/yaml", ["https://deno.land/std@0.65.0/encoding/_yaml/parse", "https://deno.land/std@0.65.0/encoding/_yaml/stringify", "https://deno.land/std@0.65.0/encoding/_yaml/schema/mod"], function (exports_32, context_32) {
    "use strict";
    var __moduleName = context_32 && context_32.id;
    return {
        setters: [
            function (parse_ts_1_1) {
                exports_32({
                    "parse": parse_ts_1_1["parse"],
                    "parseAll": parse_ts_1_1["parseAll"]
                });
            },
            function (stringify_ts_1_1) {
                exports_32({
                    "stringify": stringify_ts_1_1["stringify"]
                });
            },
            function (mod_ts_5_1) {
                exports_32({
                    "CORE_SCHEMA": mod_ts_5_1["CORE_SCHEMA"],
                    "DEFAULT_SCHEMA": mod_ts_5_1["DEFAULT_SCHEMA"],
                    "FAILSAFE_SCHEMA": mod_ts_5_1["FAILSAFE_SCHEMA"],
                    "JSON_SCHEMA": mod_ts_5_1["JSON_SCHEMA"]
                });
            }
        ],
        execute: function () {
        }
    };
});
System.register("file:///C:/Users/selineri/Reima/platform/import-collections/graphql", [], function (exports_33, context_33) {
    "use strict";
    var createAdminQueryable;
    var __moduleName = context_33 && context_33.id;
    return {
        setters: [],
        execute: function () {
            exports_33("createAdminQueryable", createAdminQueryable = (shopifyShop, shopifyBasicAuth) => async (graphQl) => {
                const resp = await fetch(`https://${shopifyShop}.myshopify.com/admin/api/2020-01/graphql.json`, {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Basic ${shopifyBasicAuth}`,
                    },
                    method: "POST",
                    body: JSON.stringify({ query: graphQl }),
                });
                if (!resp.ok)
                    throw new Error(`Could not query: ${resp.statusText}`);
                const { data, errors } = await resp.json();
                if (errors) {
                    console.error(errors);
                    throw new Error("Errors encountered - see above");
                }
                return data;
            });
        }
    };
});
System.register("file:///C:/Users/selineri/Reima/platform/import-collections/node", [], function (exports_34, context_34) {
    "use strict";
    var NodeType, getNodeType, filterType, filterPublished;
    var __moduleName = context_34 && context_34.id;
    return {
        setters: [],
        execute: function () {
            (function (NodeType) {
                NodeType[NodeType["Collection"] = 0] = "Collection";
                NodeType[NodeType["Product"] = 1] = "Product";
            })(NodeType || (NodeType = {}));
            exports_34("NodeType", NodeType);
            exports_34("getNodeType", getNodeType = (id) => {
                const match = id.match(/gid:\/\/shopify\/(\w+)\/.*/);
                if (!match)
                    throw new Error(`Could not get type from id ${id}`);
                return NodeType[match[1]];
            });
            exports_34("filterType", filterType = (type) => (obj) => getNodeType(obj.id) === type);
            exports_34("filterPublished", filterPublished = (obj) => obj.publishedOnCurrentPublication);
        }
    };
});
System.register("file:///C:/Users/selineri/Reima/platform/import-collections/queries", [], function (exports_35, context_35) {
    "use strict";
    var createBulkQuery, currentBulkOperation, collectionBulkQuery, toCollectionTypeShopify;
    var __moduleName = context_35 && context_35.id;
    return {
        setters: [],
        execute: function () {
            exports_35("createBulkQuery", createBulkQuery = (graphQl) => `mutation {
    bulkOperationRunQuery(
     query: """${graphQl}"""
    ) {
      bulkOperation {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
  }`);
            exports_35("currentBulkOperation", currentBulkOperation = `
  {
    currentBulkOperation {
      id
      status
      errorCode
      objectCount
      url
    }
  }`);
            exports_35("collectionBulkQuery", collectionBulkQuery = `
{
  collections {
    edges {
      node {
        id
        handle
        title
        descriptionHtml
        publishedOnCurrentPublication
        seo {
          title
          description
        }
        products {
          edges {
            node {
              id
              handle
              publishedOnCurrentPublication
              seo {
                title
                description
              }
            }
          }
        }
      }
    }
  }
}
`);
            exports_35("toCollectionTypeShopify", toCollectionTypeShopify = (json) => JSON.parse(json));
        }
    };
});
System.register("file:///C:/Users/selineri/Reima/platform/import-collections/domain", ["file:///C:/Users/selineri/Reima/platform/import-collections/queries", "file:///C:/Users/selineri/Reima/platform/import-collections/node"], function (exports_36, context_36) {
    "use strict";
    var queries_ts_1, node_ts_1, mapCollection, collectionHandleReducer, mapCollectionProduct, objectToDomain, jsonlToObjects;
    var __moduleName = context_36 && context_36.id;
    return {
        setters: [
            function (queries_ts_1_1) {
                queries_ts_1 = queries_ts_1_1;
            },
            function (node_ts_1_1) {
                node_ts_1 = node_ts_1_1;
            }
        ],
        execute: function () {
            exports_36("mapCollection", mapCollection = (bulkCollection) => {
                const [contentHtml, contentHtmlSummary] = bulkCollection.descriptionHtml
                    .split("[first_paragraph]");
                const collection = {
                    type: "collection",
                    handle: bulkCollection.handle,
                    title: bulkCollection.title,
                    seoTitle: bulkCollection.seo.title || bulkCollection.title,
                    seoDescription: bulkCollection.seo.description,
                };
                if (contentHtml)
                    collection.contentHtml = contentHtml;
                if (contentHtmlSummary)
                    collection.contentHtmlSummary = contentHtmlSummary;
                return collection;
            });
            exports_36("collectionHandleReducer", collectionHandleReducer = (collectionHandles, collection) => {
                return {
                    ...collectionHandles,
                    [collection.id]: collection.handle,
                };
            });
            exports_36("mapCollectionProduct", mapCollectionProduct = (collectionHandles) => (bulkCollectionProduct) => {
                const collection = collectionHandles[bulkCollectionProduct.__parentId];
                if (!collection)
                    return;
                return ({
                    type: "product",
                    handle: bulkCollectionProduct.handle,
                    collection,
                });
            });
            exports_36("objectToDomain", objectToDomain = (mapCollectionProduct) => (obj) => {
                switch (node_ts_1.getNodeType(obj.id)) {
                    case node_ts_1.NodeType.Collection:
                        return mapCollection(obj);
                    case node_ts_1.NodeType.Product:
                        return mapCollectionProduct(obj);
                }
            });
            exports_36("jsonlToObjects", jsonlToObjects = (jsonl) => {
                const parsed = jsonl
                    .split("\n")
                    .filter(Boolean)
                    .map(queries_ts_1.toCollectionTypeShopify)
                    .filter(node_ts_1.filterPublished);
                const collectionHandles = parsed
                    .filter(node_ts_1.filterType(node_ts_1.NodeType.Collection))
                    .map((obj) => obj)
                    .reduce(collectionHandleReducer, {});
                const mapProduct = mapCollectionProduct(collectionHandles);
                const domainObjects = parsed
                    .map(objectToDomain(mapProduct))
                    .filter(Boolean);
                return domainObjects;
            });
        }
    };
});
System.register("file:///C:/Users/selineri/Reima/platform/import-collections/bulk-operation", ["file:///C:/Users/selineri/Reima/platform/import-collections/queries"], function (exports_37, context_37) {
    "use strict";
    var queries_ts_2, createBulkOperation, getBulkOperationUrlWhenReady;
    var __moduleName = context_37 && context_37.id;
    function createYieldableQuery(queryable) {
        async function* getNext(graphQl) {
            while (true) {
                yield queryable(graphQl);
            }
        }
        return getNext;
    }
    return {
        setters: [
            function (queries_ts_2_1) {
                queries_ts_2 = queries_ts_2_1;
            }
        ],
        execute: function () {
            exports_37("createBulkOperation", createBulkOperation = (adminQuery) => async (query) => {
                const graphQl = queries_ts_2.createBulkQuery(query);
                const { bulkOperationRunQuery: { bulkOperation, userErrors } } = await adminQuery(graphQl);
                if (userErrors.length) {
                    console.error(userErrors);
                    throw new Error("Could not create bulk query");
                }
                return bulkOperation;
            });
            exports_37("getBulkOperationUrlWhenReady", getBulkOperationUrlWhenReady = async (adminQuery) => {
                const bulkOperationYieldable = createYieldableQuery(adminQuery)(queries_ts_2.currentBulkOperation);
                let currentStatus = "";
                const statusLoggerIntervalId = setInterval(() => {
                    console.log(`Still waiting for bulk query (${currentStatus})...`);
                }, 15000);
                for await (const result of bulkOperationYieldable) {
                    const { currentBulkOperation: { status, url } } = result;
                    currentStatus = status;
                    if (status === "COMPLETED") {
                        clearInterval(statusLoggerIntervalId);
                        return url;
                    }
                }
                throw new Error("Bulk operation not for awaitable");
            });
        }
    };
});
System.register("file:///C:/Users/selineri/Reima/platform/import-collections/filesystem", [], function (exports_38, context_38) {
    "use strict";
    var serializeContent, writeFileToDir, deleteDirectory, dirname;
    var __moduleName = context_38 && context_38.id;
    return {
        setters: [],
        execute: function () {
            exports_38("serializeContent", serializeContent = (stringifier) => (obj) => ({
                path: obj.path,
                data: `---\n${stringifier(obj.content)}\n---`,
            }));
            exports_38("writeFileToDir", writeFileToDir = (dir) => async (file) => {
                const path = `${dir}/${file.path}`;
                await Deno.mkdir(dirname(path), { recursive: true });
                await Deno.writeFile(path, new TextEncoder().encode(file.data));
            });
            exports_38("deleteDirectory", deleteDirectory = async (dir) => {
                try {
                    await Deno.remove(dir, { recursive: true });
                }
                catch (error) {
                    if (!(error instanceof Deno.errors.NotFound))
                        throw error;
                }
            });
            exports_38("dirname", dirname = (path) => {
                const arr = path.split("/");
                arr.pop();
                return arr.join("/");
            });
        }
    };
});
System.register("file:///C:/Users/selineri/Reima/platform/import-collections/content", [], function (exports_39, context_39) {
    "use strict";
    var addContentModule, toCollectionContent, toCollectionProductContent, toContent;
    var __moduleName = context_39 && context_39.id;
    return {
        setters: [],
        execute: function () {
            addContentModule = (modules) => (htmlContent) => {
                modules.push({
                    template: "content",
                    content: "",
                    usehtml: true,
                    contenthtml: htmlContent,
                });
            };
            exports_39("toCollectionContent", toCollectionContent = (collection) => {
                const main = [];
                const addContent = addContentModule(main);
                if (collection.contentHtmlSummary)
                    addContent(collection.contentHtmlSummary);
                main.push({
                    template: "products",
                    collection: collection.handle,
                });
                if (collection.contentHtml)
                    addContent(collection.contentHtml);
                return {
                    path: `${collection.handle}/_index.md`,
                    type: "collection",
                    content: {
                        layout: "collection",
                        handle: collection.handle,
                        title: collection.title,
                        seotitle: collection.seoTitle,
                        seodescription: collection.seoDescription,
                        filters: true,
                        main,
                    },
                };
            });
            exports_39("toCollectionProductContent", toCollectionProductContent = (collectionProduct, counter) => ({
                path: `${collectionProduct.collection}/products/${collectionProduct.handle}.md`,
                type: "product",
                collection: collectionProduct.collection,
                content: {
                    noindex: true,
                    type: "products",
                    weight: counter,
                },
            }));
            exports_39("toContent", toContent = (obj, counter) => {
                switch (obj.type) {
                    case "collection":
                        return toCollectionContent(obj);
                    case "product":
                        return toCollectionProductContent(obj, counter);
                }
            });
        }
    };
});
System.register("file:///C:/Users/selineri/Reima/platform/import-collections/workflow", ["file:///C:/Users/selineri/Reima/platform/import-collections/domain", "file:///C:/Users/selineri/Reima/platform/import-collections/graphql", "file:///C:/Users/selineri/Reima/platform/import-collections/queries", "file:///C:/Users/selineri/Reima/platform/import-collections/bulk-operation", "file:///C:/Users/selineri/Reima/platform/import-collections/filesystem", "file:///C:/Users/selineri/Reima/platform/import-collections/content"], function (exports_40, context_40) {
    "use strict";
    var domain_ts_1, graphql_ts_1, queries_ts_3, bulk_operation_ts_1, filesystem_ts_1, content_ts_1, download, log, runInBatches;
    var __moduleName = context_40 && context_40.id;
    function* chunk(array, size) {
        for (let i = 0; i < array.length; i += size) {
            yield array.slice(i, i + size);
        }
        return;
    }
    async function syncCollections(shopifyShop, shopifyBasicAuth, collectionsDir, stringifier) {
        const adminQueryable = graphql_ts_1.createAdminQueryable(shopifyShop, shopifyBasicAuth);
        const runBulkQuery = bulk_operation_ts_1.createBulkOperation(adminQueryable);
        const runCollectionBulkQuery = () => runBulkQuery(queries_ts_3.collectionBulkQuery);
        const getBulkOperationUrl = () => bulk_operation_ts_1.getBulkOperationUrlWhenReady(adminQueryable);
        const serialize = filesystem_ts_1.serializeContent(stringifier);
        const write = filesystem_ts_1.writeFileToDir(collectionsDir);
        const jsonl = await Promise.resolve()
            .then(log('Running bulk query...', false))
            .then(runCollectionBulkQuery)
            .then(getBulkOperationUrl)
            .then(log("Bulk operation url:"))
            .then(download);
        const files = domain_ts_1.jsonlToObjects(jsonl)
            .map(content_ts_1.toContent)
            .map(serialize);
        console.log("Writing files...");
        await filesystem_ts_1.deleteDirectory(collectionsDir);
        const batch = runInBatches(50);
        await Promise.resolve(files)
            .then(batch(write));
        console.log("Success!");
    }
    exports_40("default", syncCollections);
    return {
        setters: [
            function (domain_ts_1_1) {
                domain_ts_1 = domain_ts_1_1;
            },
            function (graphql_ts_1_1) {
                graphql_ts_1 = graphql_ts_1_1;
            },
            function (queries_ts_3_1) {
                queries_ts_3 = queries_ts_3_1;
            },
            function (bulk_operation_ts_1_1) {
                bulk_operation_ts_1 = bulk_operation_ts_1_1;
            },
            function (filesystem_ts_1_1) {
                filesystem_ts_1 = filesystem_ts_1_1;
            },
            function (content_ts_1_1) {
                content_ts_1 = content_ts_1_1;
            }
        ],
        execute: function () {
            download = async (url) => {
                const response = await fetch(url);
                return await response.text();
            };
            log = (description, logValue = true) => (input) => {
                console.log(description);
                if (logValue)
                    console.log(input);
                return input;
            };
            runInBatches = (operationsPerBatch) => (fn) => async (inputArray) => {
                console.log(`Running batched await operation ${inputArray.length} by ${operationsPerBatch}...`);
                console.time('Done');
                for (const partialArray of chunk(inputArray, operationsPerBatch)) {
                    await Promise.all(partialArray.map(fn));
                }
                console.timeEnd('Done');
            };
        }
    };
});
System.register("file:///C:/Users/selineri/Reima/platform/import-collections/cmd", ["https://deno.land/std@0.65.0/encoding/yaml", "file:///C:/Users/selineri/Reima/platform/import-collections/workflow"], function (exports_41, context_41) {
    "use strict";
    var yaml_ts_1, workflow_ts_1, _a, shopifyShop, directory, shopifyBasicAuth, usage;
    var __moduleName = context_41 && context_41.id;
    return {
        setters: [
            function (yaml_ts_1_1) {
                yaml_ts_1 = yaml_ts_1_1;
            },
            function (workflow_ts_1_1) {
                workflow_ts_1 = workflow_ts_1_1;
            }
        ],
        execute: async function () {
            _a = Deno.args, shopifyShop = _a[0], directory = _a[1];
            shopifyBasicAuth = Deno.env.get("SHOPIFY_BASIC_AUTH");
            usage = `
Import Shopify collections into the specified directory.

Usage: import-collections [shopify shop] [collections directory]

Set the SHOPIFY_BASIC_AUTH environment variable to the
base64-encoded value of "[API key]:[Password]".
`;
            if (!shopifyShop || !directory || !shopifyBasicAuth) {
                console.log(usage);
                Deno.exit(1);
            }
            await workflow_ts_1.default(shopifyShop, shopifyBasicAuth, directory, yaml_ts_1.stringify);
        }
    };
});

await __instantiate("file:///C:/Users/selineri/Reima/platform/import-collections/cmd", true);
