import z from "../lib/_deps/z.ts";

import DeployAbstraction from "./DeployAbstraction.ts";
import KubernetesManifest from "./KubernetesManifest.ts";

const schema = z.array(
  z.union([DeployAbstraction, KubernetesManifest]),
);

export default schema;
export type DocumentDeployType = z.infer<typeof schema>;
