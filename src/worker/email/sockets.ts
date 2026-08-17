/* ════════════════════════════════════
   Workers-only socket wiring — isolated so client.ts stays loadable
   in Node (tests inject their own connect). Never imported outside
   the worker bundle.
   ════════════════════════════════════ */

import { connect } from "cloudflare:sockets";

export const workerConnect = connect;