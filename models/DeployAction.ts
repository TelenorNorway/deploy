import z from "../lib/_deps/z.ts";

const schema = z.object({
  type: z.literal("action")
    .default("action") as unknown as z.ZodLiteral<"action">,
  explain: z.string(),
  use: z.string(),
  with: z.any().optional(),
});

export default schema;
export type DeployActionType = z.infer<typeof schema>;
