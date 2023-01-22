const crypto = require('crypto');
const { getSecret } = require('../store');

module.exports = function verifySignature() {
  /**
   * @param {import('koa').Context} ctx
   * @param {import('koa').Next} next
   */
  return async (ctx, next) => {
    // https://developers.asana.com/docs/webhook-security
    const signature = ctx.req.headers['x-hook-signature'];
    if (!signature) {
      console.log('No signature');
      ctx.status = 400;
      return;
    }

    const secret = await getSecret();
    const computedSignature = crypto
      .createHmac('SHA256', secret)
      .update(JSON.stringify(ctx.request.body))
      .digest('hex');
    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(ctx.req.headers['x-hook-signature']),
      Buffer.from(computedSignature)
    );
    if (!isSignatureValid) {
      console.log('Invalid signature');
      ctx.status = 400;
      return;
    }

    await next();
  };
};
