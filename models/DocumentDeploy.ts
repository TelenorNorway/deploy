import z from "../lib/_deps/z.ts";

import DeployAction from "./DeployAction.ts";
import KubernetesManifest from "./KubernetesManifest.ts";

const schema = z.array(
  z.union([DeployAction, KubernetesManifest]),
);

export default schema;
export type DocumentDeployType = z.infer<typeof schema>;
