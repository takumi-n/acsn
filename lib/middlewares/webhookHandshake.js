const { storeSecret } = require('../store');

module.exports = function webhookHandshake() {
  /**
   * @param {import('koa').Context} ctx
   * @param {import('koa').Next} next
   */
  return async (ctx, next) => {
    console.log('[mw] webhookHandshake');
    // https://developers.asana.com/docs/setting-up-a-webhook
    if (ctx.req.headers['x-hook-secret']) {
      console.log('Received handshake request');
      const secret = ctx.req.headers['x-hook-secret'];
      await storeSecret(secret);
      ctx.set('x-hook-secret', secret);
      ctx.status = 200;
      return;
    }

    await next();
  };
};
