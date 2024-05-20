import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { error } from 'node:console'

export default class CheckAdminMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = await ctx.auth.authenticate()
    if (user.roles === 10) {
      await next()
    } else {
      throw error
    }
    await next()
  }
}
