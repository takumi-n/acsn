const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const { IncomingWebhook } = require('@slack/webhook');
const AsanaClient = require('./asana');
const webhookHandshake = require('./middlewares/webhookHandshake');
const refetchSecret = require('./middlewares/refetchSecret');
const verifySignature = require('./middlewares/verifySignature');
const { composeNotification, composeError } = require('./slack');
const koaLogger = require('koa-logger');

/**
 *
 * @param {Object} opts
 * @param {string} opts.baseUrl
 * @param {string} opts.asanaPat
 * @param {string} opts.slackWebhookUrl
 * @param {string} opts.workspaceId
 * @param {string} opts.projectId
 */
module.exports = function webhookApp(opts) {
  const asanaClient = new AsanaClient(opts.asanaPat, opts.workspaceId, opts.projectId, opts.baseUrl);
  const webhook = new IncomingWebhook(opts.slackWebhookUrl);

  const app = new Koa();

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      console.error(err);
      await webhook.send(composeError(err));
      ctx.status = err.statusCode || err.status || 500;
      ctx.body = {
        message: err.message,
      };
    }
  });

  app.use(koaLogger());
  app.use(bodyParser());

  // Middlewares for Asana webhook convention
  app.use(webhookHandshake());
  app.use(refetchSecret(asanaClient));
  app.use(verifySignature());

  const router = new Router();
  router.post('/webhook', async (ctx) => {
    ctx.status = 200;
    const resources = ctx.request.body.events
      .map((e) => e.resource)
      .filter((r) => r.resource_subtype === 'comment_added');
    const gids = resources.map((r) => r.gid);

    for (const gid of gids) {
      try {
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
      } catch (e) {
        console.error(err);
        await webhook.send(composeError(err));
      }
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
