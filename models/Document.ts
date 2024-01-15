import z from "../lib/_deps/z.ts";

import DocumentMetadata from "./DocumentMetadata.ts";
import DocumentDeploy from "./DocumentDeploy.ts";

const schema = z.object({
  metadata: DocumentMetadata.optional(),
  deploy: DocumentDeploy.array(),
});

export default schema;
export type DocumentType = z.infer<typeof schema>;
