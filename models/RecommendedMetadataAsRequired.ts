import z from "../lib/_deps/z.ts";

const schema = z.object({
  k8s_application: z.string(),
  k8s_namespace: z.string(),
  k8s_app_version: z.string(),
  k8s_app_environment: z.record(z.string()),
}).strict();

export default schema;
export type RecommendedMetadataAsRequired = Omit<
  z.infer<typeof schema>,
  "type"
>;
