import {
  black,
  bold,
  brightBlue,
  brightRed,
  brightYellow,
  fromFileUrl,
  relative,
  sprintf,
  underline,
} from "../_deps/std.ts";
import { StackTraceElement } from "./_stack_parser.ts";

abstract class Output {
  actionsPrefix?: string;
  consolePrefix?: string;

  abstract actions(message: string): void;
  abstract console(message: string): void;

  sprintf(format: string, args: unknown[]) {
    return sprintf(format, ...args);
  }

  print(format: string, args: unknown[]) {
    this.console((this.consolePrefix || "") + this.sprintf(format, args));
  }
}

const INFO = new class extends Output {
  actions = console.log;
  console = console.log;

  consolePrefix = bold(brightBlue("info")) + ": ";
  actionsPrefix = "info: ";
}();

const WARNING = new class extends Output {
  actions = console.warn;
  console = console.warn;

  consolePrefix = bold(brightYellow("warning")) + ": ";
  actionsPrefix = "warning: ";
}();

const ERROR = new class extends Output {
  actions = console.error;
  console = console.error;

  consolePrefix = bold(brightRed("error")) + ": ";
  actionsPrefix = "error: ";
}();

const BASIC = new class extends Output {
  actions = console.log;
  console = console.log;
}();

const DEBUG = new class extends Output {
  actions = console.debug;
  console = console.debug;

  #debugInfoRegex = /debugInfo\([^\)]*\)/;
  #boldRegex = /\<[^\>]*\>/;

  sprintf(format: string, args: unknown[]): string {
    const message = super.sprintf(format, args);
    return message.replace(this.#debugInfoRegex, (match) => {
      return black(
        match.slice(10, -1).replace(
          this.#boldRegex,
          (match) => bold(match.slice(1, -1)),
        ),
      );
    });
  }
}();

export function warning(format: string, ...args: unknown[]) {
  WARNING.print(format, args);
}

export function error(format: string, ...args: unknown[]) {
  ERROR.print(format, args);
}

export function info(format: string, ...args: unknown[]) {
  INFO.print(format, args);
}

export function normal(format: string, ...args: unknown[]) {
  BASIC.print(format, args);
}

export function getLocation(): string | undefined {
  let file = new Error().stack?.split("\n")?.[3];
  if (!file) return;
  const ste = new StackTraceElement(file) || undefined;
  if (!ste.filename || !ste.filename.startsWith("file://")) return;
  file = fromFileUrl(ste.filename);
  file = relative(Deno.cwd(), file);
  const location = underline(`${file}:${ste.y}:${ste.x}`);
  let name = "";
  if (ste.isAsync) name += "async ";
  if (ste.isNew) name += "new ";
  if (ste.isAnonymous) name += "<anonymous>" + " ";
  else {
    if (ste.typeName) name += ste.typeName + ".";
    name += ste.functionName + " ";
  }
  if (ste.methodName) name += `[as ${ste.methodName}] `;
  name = bold(name);
  return black(`${name}in ${location}`);
}

export function debug(format: string, ...args: unknown[]) {
  const location = getLocation();
  DEBUG.print("%s" + format, [location ? location + " " : "", ...args]);
}
