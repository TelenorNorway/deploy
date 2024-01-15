// deno-lint-ignore-file no-explicit-any ban-types
import type { DocumentDeployType } from "deploy";
import z from "../_deps/z.ts";

export interface UserAbstraction<Metadata, Argument> {
  readonly meta?: z.ZodSchema<Metadata>;
  readonly arg?: z.ZodSchema<Argument>;
  unabstract(data: {
    selfRepository: string;
    selfVersion: string;
    arg: z.infer<z.ZodSchema<Argument>>;
    meta: z.infer<z.ZodSchema<Metadata>>;
  }): Promise<DocumentDeployType[]> | DocumentDeployType[];
}

export function defineAbstraction<Metadata, Argument>(
  schemas: {
    arg: z.ZodSchema<Argument>;
    meta: z.ZodSchema<Metadata>;
  },
  unabstract: (
    data: {
      selfRepository: string;
      selfVersion: string;
      meta: z.infer<z.ZodSchema<Metadata>>;
      arg: z.infer<z.ZodSchema<Argument>>;
    },
  ) => Promise<DocumentDeployType[]> | DocumentDeployType[],
): UserAbstraction<Metadata, Argument>;

export function defineAbstraction<Metadata>(
  schemas: {
    arg?: z.ZodSchema<{}>;
    meta: z.ZodSchema<Metadata>;
  },
  unabstract: (
    data: {
      selfRepository: string;
      selfVersion: string;
      meta: z.infer<z.ZodSchema<Metadata>>;
    },
  ) => Promise<DocumentDeployType[]> | DocumentDeployType[],
): UserAbstraction<Metadata, unknown>;

export function defineAbstraction<Argument>(
  schemas: {
    arg: z.ZodSchema<Argument>;
    meta?: z.ZodSchema<{}>;
  },
  unabstract: (
    data: {
      selfRepository: string;
      selfVersion: string;
      arg: z.infer<z.ZodSchema<Argument>>;
    },
  ) => Promise<DocumentDeployType[]> | DocumentDeployType[],
): UserAbstraction<unknown, Argument>;

export function defineAbstraction(
  schemas: {
    arg?: z.ZodSchema<{}>;
    meta?: z.ZodSchema<{}>;
  },
  unabstract: (
    data: {
      selfRepository: string;
      selfVersion: string;
    },
  ) => Promise<DocumentDeployType[]> | DocumentDeployType[],
): UserAbstraction<unknown, unknown>;

export function defineAbstraction(
  { meta, arg }: any,
  unabstract: any,
): UserAbstraction<any, any> {
  return { meta, arg, unabstract };
}
