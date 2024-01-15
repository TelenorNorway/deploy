import z from "../lib/_deps/z.ts";

const schema = z.record(z.any());

export default schema;
export type DocumentMetadataType = z.infer<typeof schema>;
