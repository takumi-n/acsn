module.exports = function webhookHandshake(storeSecret) {
  /**
   * @param {import('koa').Context} ctx
   * @param {import('koa').Next} next
   */
  return async (ctx, next) => {
    // https://developers.asana.com/docs/setting-up-a-webhook
    if (ctx.req.headers['x-hook-secret']) {
      console.log('Webhook handshake');
      const secret = ctx.req.headers['x-hook-secret'];
      await storeSecret(secret);
      ctx.set('x-hook-secret', secret);
      ctx.status = 200;
      return;
    }

    next();
  };
};
