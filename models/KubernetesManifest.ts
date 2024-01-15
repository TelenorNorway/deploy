import z from "../lib/_deps/z.ts";

const schema = z.object({
  type: z.literal("manifest")
    .default("manifest") as unknown as z.ZodLiteral<"manifest">,
  apiVersion: z.string(),
  kind: z.string(),
  metadata: z.record(z.any()).optional(),
  spec: z.record(z.any()).optional(),
}).strict();

export default schema;
export type KubernetesManifestType = Omit<z.infer<typeof schema>, "type">;
