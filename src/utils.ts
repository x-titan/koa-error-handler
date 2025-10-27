import type { Context } from "koa"

export function isResponded(ctx: Context){
  return Boolean(
    ctx.headerSent ||
    (ctx.respond === false) ||
    (ctx.body != null) ||
    (ctx.status && ctx.status !== 404)
  )
}
