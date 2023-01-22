const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const { IncomingWebhook } = require('@slack/webhook');
const AsanaClient = require('./asana');
const webhookHandshake = require('./middlewares/webhookHandshake');
const refetchSecret = require('./middlewares/refetchSecret');
const verifySignature = require('./middlewares/verifySignature');
const { composeNotification } = require('./slack');
const koaLogger = require('koa-logger');
const { storeSecret, getSecret } = require('./store');

/**
 *
 * @param {Object} opts
 * @param {string} opts.baseUrl
 * @param {string} opts.asanaPat
 * @param {string} opts.slackWebhookUrl
 * @param {string} opts.workspaceId
 * @param {string} opts.projectId
 * @param {(secret: string) => Promise<void>} opts.storeSecret
 * @param {() => Promise<string>} opts.getSecret
 */
module.exports = function webhookApp(opts) {
  const asanaClient = new AsanaClient(opts.asanaPat, opts.workspaceId, opts.projectId, opts.baseUrl);
  const webhook = new IncomingWebhook(opts.slackWebhookUrl);

  const app = new Koa();
  app.use(koaLogger());
  app.use(bodyParser());

  // Middlewares for Asana webhook convention
  app.use(webhookHandshake(storeSecret));
  app.use(refetchSecret(asanaClient, getSecret));
  app.use(verifySignature(getSecret));

  const router = new Router();
  router.post('/webhook', async (ctx) => {
    ctx.status = 200;
    const resources = ctx.request.body.events.map((e) => e.resource);
    const gids = resources.map((r) => r.gid);

    for (const gid of gids) {
      const comment = await asanaClient.getComment(gid);
      await webhook.send(
        composeNotification(
          comment.created_by.name,
          opts.projectId,
          comment.target.gid,
          comment.target.name,
          comment.text
        )
      );
    }
  });

  app.use(router.routes()).use(router.allowedMethods());

  const result = {
    startServer: (port) => {
      const server = app.listen(port);
      process.on('SIGINT', () => {
        server.close();
      });
    },

    getHandler: () => app.callback(),

    startWebhook: async () => {
      try {
        await asanaClient.registerWebhook();
        process.on('SIGINT', () => {
          asanaClient.deleteExistingWebhook().then(() => {
            process.exit(0);
          });
        });
      } catch (e) {
        console.error(e.value.errors);
        process.exit(1);
      }
    },
  };

  return result;
};
