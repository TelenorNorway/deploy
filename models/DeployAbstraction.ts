import z from "../lib/_deps/z.ts";

const schema = z.object({
  type: z.literal("abstraction")
    .default("abstraction") as unknown as z.ZodLiteral<"abstraction">,
  explain: z.string(),
  use: z.string(),
  with: z.any().optional(),
});

export default schema;
export type DeployAbstractionType = Omit<z.infer<typeof schema>, "type">;
