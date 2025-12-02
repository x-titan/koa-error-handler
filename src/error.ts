import { isResponded } from "./utils"

import type {
  Context,
  Next,
} from "koa"
import type {
  ErrorHandlerOptions,
  ErrorEventListener,
  ErrorEvent,
} from "./types"

export default function error(options?: ErrorHandlerOptions | ErrorEventListener) {
  if (typeof options === "function") {
    options = { onerror: options }
  }

  const {
    debug = process.env.NODE_ENV === "development",
    prepare,
    onerror,
    finalize,
  } = options || {}

  return async function errorHandler(ctx: Context, next: Next) {
    try {
      await next()
      if (!isResponded(ctx))
        ctx.throw(404, `Route ${ctx.method} ${ctx.path} not found`)
    } catch (err: any) {
      if (debug) console.error(err)
      ctx.app.emit("error", err, ctx)

      if (isResponded(ctx)) {
        console.error("Response has already been sent")
        return
      }

      const preparedError = prepare ? prepare(err) : err

      const event: ErrorEvent = {
        error: preparedError,
        status: preparedError.status || ctx.status || 500,
        type: null!,
        body: null,

        meta: {
          accepts: ctx.accepts(),
          method: ctx.method,
          path: ctx.path,
        },
      }

      if (onerror) onerror(event)
      if (finalize) finalize(event)

      ctx.status = event.status
      ctx.body = event.body ?? {
        error: preparedError.message || "Internal Server Error"
      }

      if (event.type) ctx.type = event.type
    }
  }
}
