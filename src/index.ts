import { isResponded } from "./utils"
import type { Context, Next } from "koa"

export type ErrorState<
  Err = any
> = {
  error: Err,
  status: number,
  body: any,
  type: string,

  meta: {
    accepts: string[],
    method: string,
    path: string
  },
}

export type Formatter<Err = any> = (errorState: ErrorState<Err>) => void

export interface ErrorHandlerOptions {
  prepare?: (error: any) => any
  formatter?: Formatter
  finalize?: Formatter,
  debug?: boolean
}

export default function error(options?: ErrorHandlerOptions | Formatter) {
  if (typeof options === "function") {
    options = { formatter: options }
  }

  const {
    debug = process.env.NODE_ENV === "development",
    prepare,
    formatter,
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

      const error = prepare ? prepare(err) : err

      const errorState: ErrorState = {
        error,
        status: error.status || ctx.status || 500,
        type: "application/json",
        body: null,

        meta: {
          accepts: ctx.accepts(),
          method: ctx.method,
          path: ctx.path,
        },
      }

      if (formatter) formatter(errorState)
      if (finalize) finalize(errorState)

      ctx.status = errorState.status
      ctx.type = errorState.type
      ctx.body = errorState.body || {
        error: error.message || "Internal Server Error"
      }
    }
  }
}
