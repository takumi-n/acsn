const { getSecret } = require('../store');

/**
 * Refetch Webhook secret automatically when it's not available.
 *
 * @param {import('../asana')} asanaClient
 */
module.exports = function refetchSecret(asanaClient) {
  /**
   * @param {import('koa').Context} ctx
   * @param {import('koa').Next} next
   */
  return async (ctx, next) => {
    const secret = await getSecret();
    if (!secret) {
      console.log('No secret');
      ctx.status = 400;
      await asanaClient.deleteExistingWebhook();
      await asanaClient.registerWebhook();
      return;
    }

    await next();
  };
};
