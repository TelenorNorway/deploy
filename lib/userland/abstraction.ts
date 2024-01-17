// deno-lint-ignore-file no-explicit-any ban-types
import type { DocumentDeployType } from "../../models/DocumentDeploy.ts";
import z from "../_deps/z.ts";

export interface AbstractionUtils {
  setLabel(label: string, value: string): void;
  assignMeta(meta: Record<string, unknown>): void;
  repo(path: string): string;
}

export interface AbstractionInformation extends AbstractionUtils {
  readonly selfRepository: string;
  readonly selfVersion: string;
}

export interface UserAbstraction<Metadata, Argument> {
  readonly meta?: z.ZodSchema<Metadata>;
  readonly arg?: z.ZodSchema<Argument>;

  unabstract(
    data: {
      arg: z.infer<z.ZodSchema<Argument>>;
      meta: z.infer<z.ZodSchema<Metadata>>;
    } & AbstractionInformation,
  ): Promise<DocumentDeployType[]> | DocumentDeployType[];
}

export function defineAbstraction<Metadata, Argument>(
  schemas: {
    arg: z.ZodSchema<Argument>;
    meta: z.ZodSchema<Metadata>;
  },
  unabstract: (
    data: {
      meta: z.infer<z.ZodSchema<Metadata>>;
      arg: z.infer<z.ZodSchema<Argument>>;
    } & AbstractionInformation,
  ) => Promise<DocumentDeployType[]> | DocumentDeployType[],
): UserAbstraction<Metadata, Argument>;

export function defineAbstraction<Metadata>(
  schemas: {
    arg?: z.ZodSchema<{}>;
    meta: z.ZodSchema<Metadata>;
  },
  unabstract: (
    data: {
      meta: z.infer<z.ZodSchema<Metadata>>;
    } & AbstractionInformation,
  ) => Promise<DocumentDeployType[]> | DocumentDeployType[],
): UserAbstraction<Metadata, unknown>;

export function defineAbstraction<Argument>(
  schemas: {
    arg: z.ZodSchema<Argument>;
    meta?: z.ZodSchema<{}>;
  },
  unabstract: (
    data: {
      arg: z.infer<z.ZodSchema<Argument>>;
    } & AbstractionInformation,
  ) => Promise<DocumentDeployType[]> | DocumentDeployType[],
): UserAbstraction<unknown, Argument>;

export function defineAbstraction(
  schemas: {
    arg?: z.ZodSchema<{}>;
    meta?: z.ZodSchema<{}>;
  },
  unabstract: (
    data: {} & AbstractionInformation,
  ) => Promise<DocumentDeployType[]> | DocumentDeployType[],
): UserAbstraction<unknown, unknown>;

export function defineAbstraction(
  { meta, arg }: any,
  unabstract: any,
): UserAbstraction<any, any> {
  return { meta, arg, unabstract };
}
