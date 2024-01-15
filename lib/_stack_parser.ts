// Copied from https://deno.land/x/cstack@0.4.6/cstack.ts?source
// Modified to fit the needs of this project.

const anon = "<anonymous>";

export class Line {
  public readonly no: number;
  public readonly noLen: number;
  public readonly line: string;
  public constructor(no: number, line: string) {
    this.no = no;
    this.line = line;
    this.noLen = no.toString().length;
  }
}

export class OptLocation {
  public y: number | null = null;
  public x: number | null = null;
  public constructor(y?: number | null, x?: number | null) {
    this.y = y || null;
    this.x = x || null;
  }
}

export class OptFile extends OptLocation {
  public static parseFileName(filename: string): OptFile {
    let y: number | null = null;
    let x: number | null = null;
    const _x_ = filename.lastIndexOf(":");
    let _filenameIndexEnd = filename.length;
    if (_x_ !== -1) {
      const _x = Number(filename.substring(_x_ + 1, filename.length));
      if (Number.isSafeInteger(_x) && _x > -1) {
        const _y_ = filename.lastIndexOf(":", _x_ - 1);
        if (_y_ !== -1) {
          const _y = Number(filename.substring(_y_ + 1, _x_));
          if (Number.isSafeInteger(_y) && _y > -1) {
            y = _y;
            x = _x;
            _filenameIndexEnd = _y_;
          } else {
            y = _x;
            _filenameIndexEnd = _x_;
          }
        } else {
          y = _x;
          _filenameIndexEnd = _x_;
        }
      }
    }
    return new OptFile(filename.substring(0, _filenameIndexEnd), y, x);
  }
  public filename: string | null;
  public constructor(
    filename?: string | null,
    y?: number | null,
    x?: number | null,
  ) {
    super(y, x);
    this.filename = filename || null;
  }
}

export class Utils {
  public static buildLineNumberStringWithoutColors(
    y?: number | null,
    x?: number | null,
  ): string {
    return (y !== null ? ":" + y + (x !== null ? ":" + x : "") : "");
  }
}

export class EvalStackItem {
  public name: string | null = null;
  public y: number | null = null;
  public x: number | null = null;
  public constructor(
    name?: string | null,
    y?: number | null,
    x?: number | null,
  ) {
    if (typeof name !== "undefined") this.name = name;
    if (typeof y !== "undefined") this.y = y;
    if (typeof x !== "undefined") this.x = x;
  }
  public buildLineNumberStringWithoutColors(): string {
    return Utils.buildLineNumberStringWithoutColors(this.y, this.x);
  }
}

export class StackTraceElement {
  #codeUrl?: string;

  public readonly line: string;
  public readonly parsed: boolean = false;

  public isFunction: boolean | null = null;
  public isNew: boolean | null = null;
  public isAsync: boolean | null = null;
  public isAnonymous: boolean | null = null;
  public isUnknown: boolean | null = null;
  public isNative: boolean | null = null;
  public isEval: boolean | null = null;
  public isCodeLine = false;

  public typeName: string | null = null;
  public functionName: string | null = null;
  public methodName: string | null = null;
  public location: string | null = null;

  public filename: string | null = null;
  public x: number | null = null;
  public y: number | null = null;

  public eval: EvalStackItem[] | null = null;

  public name: string | null = null;

  public constructor(line: string) {
    this.line = line;
    this.isCodeLine = /^\s*\|/.test(this.line);

    if (line.substring(0, 7) !== "    at ") {
      return this;
    }

    let isAsync = false;
    let isNew = false;
    let typeName: string | null = null;
    let functionName: string | null = null;
    let methodName: string | null = null;
    let location: string | null = null;
    let evalStack:
      | [name: string | null, y: number | null, x: number | null][]
      | null = null;
    let filename: string | null = null;

    let y: number | null = null;
    let x: number | null = null;

    let _nameStartIndex = 7;

    if (line.substring(7, 13) === "async ") {
      isAsync = true;
      if (line.substring(13, 17) === "new ") {
        isNew = true;
        _nameStartIndex = 17;
      } else {
        _nameStartIndex = 13;
      }
    } else if (line.substring(7, 11) === "new ") {
      isNew = true;
      _nameStartIndex = 11;
    }

    const _nameEndIndex1 = line.indexOf(" (", _nameStartIndex);
    const _nameEndIndex2 = line.indexOf(" [as ", _nameStartIndex);
    const _containsMethodName = _nameEndIndex2 !== -1;

    let _nameEndIndex = -1;
    if (_nameEndIndex2 > 0) _nameEndIndex = _nameEndIndex2;
    else if (_nameEndIndex1 > 0) _nameEndIndex = _nameEndIndex1;
    if (_nameEndIndex === -1) {
      let _locationEnd = line.lastIndexOf(":", _nameStartIndex);
      if (_locationEnd === -1) _locationEnd = line.length;
      location = line.substring(_nameStartIndex, _locationEnd);
    } else {
      const _nameTmp = line.substring(_nameStartIndex, _nameEndIndex);
      const _typeEndIndex = _nameTmp.indexOf(".");
      if (isNew && _typeEndIndex !== -1) return this;
      if (_typeEndIndex !== -1) {
        typeName = _nameTmp.substring(0, _typeEndIndex);
        functionName = _nameTmp.substring(_typeEndIndex + 1, _nameTmp.length);
      } else {
        functionName = _nameTmp;
      }
      if (
        _containsMethodName && _typeEndIndex !== -1 ||
        _containsMethodName && isNew
      ) {
        return this;
      }
      let _locationStart = _nameEndIndex + 2;
      if (_containsMethodName) {
        const _methodNameEndIndex = line.indexOf("] (", _nameEndIndex);
        methodName = line.substring(_nameEndIndex + 5, _methodNameEndIndex);
        _locationStart = _methodNameEndIndex + 3;
      }
      const _locationEnd = line.lastIndexOf(")");
      if (_locationEnd === -1) return this;
      location = line.substring(_locationStart, _locationEnd);
    }
    let _tmpLocation = location;
    while (_tmpLocation.substring(0, 8) === "eval at ") {
      evalStack ??= [];
      const _evalNameEnd = _tmpLocation.indexOf(" (");
      const _evalPositionEnd = _tmpLocation.lastIndexOf(")");
      if (_evalNameEnd === -1 || _evalPositionEnd === -1) return this;
      let __y: number | null = null;
      let __x: number | null = null;
      const _isAtEnd = _tmpLocation.indexOf(", ", _evalPositionEnd);
      if (_isAtEnd !== -1) {
        const ___ = OptFile.parseFileName(_tmpLocation.substring(
          _isAtEnd + 2,
          _tmpLocation.length,
        ));
        __y = ___.y;
        __x = ___.x;
      }
      let name: string | null = _tmpLocation.substring(8, _evalNameEnd);
      if (name === anon) name = null;
      evalStack.push([name, __y, __x]);
      _tmpLocation = _tmpLocation.substring(
        _evalNameEnd + 2,
        _evalPositionEnd,
      );
    }
    const ___ = OptFile.parseFileName(_tmpLocation);
    filename = ___.filename;
    y = ___.y;
    x = ___.x;

    if (filename!.substring(0, 7) === "file://" && y !== null) {
      this.#codeUrl = filename!.substring(7, filename!.length);
    }

    this.isAsync = isAsync;
    this.isEval = evalStack !== null;
    this.isNew = isNew;
    this.isFunction = functionName != null;
    this.isNative = filename === "native";
    this.isUnknown = filename === "unknown location";
    this.isAnonymous = filename === anon;
    this.typeName = typeName;
    this.functionName = functionName;
    this.methodName = methodName;
    this.location = location;
    if (evalStack !== null) {
      this.eval = evalStack.map((_) => new EvalStackItem(_[0], _[1], _[2]));
    }
    this.filename = filename;
    this.y = y;
    this.x = x;
    this.parsed = true;
  }

  public buildLineNumberStringWithoutColors(): string {
    return Utils.buildLineNumberStringWithoutColors(this.y, this.x);
  }
}
