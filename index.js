const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const asana = require('asana');
const crypto = require('crypto');
const { IncomingWebhook } = require('@slack/webhook');

require('dotenv').config();

async function main() {
  const client = asana.Client.create().useAccessToken(process.env.ASANA_PAT);
  const webhook = new IncomingWebhook(process.env.WEBHOOK_URL);

  const app = new Koa();
  app.use(bodyParser());

  // Webhook handshake
  // https://developers.asana.com/docs/setting-up-a-webhook
  let secret = '';
  app.use((ctx, next) => {
    if (ctx.req.headers['x-hook-secret']) {
      console.log('Webhook handshake');
      secret = ctx.req.headers['x-hook-secret'];
      ctx.set('x-hook-secret', secret);
      ctx.status = 200;
      return;
    }
    next();
  });

  // Verify signature
  // https://developers.asana.com/docs/webhook-security
  app.use((ctx, next) => {
    const signature = ctx.req.headers['x-hook-signature'];
    if (!signature) {
      console.log('No signature');
      ctx.status = 400;
      return;
    }

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

    next();
  });

  const router = new Router();
  router.post('/webhook', async (ctx) => {
    ctx.status = 200;
    const resources = ctx.request.body.events.map((e) => e.resource);
    const gids = resources.map((r) => r.gid);

    for (const gid of gids) {
      const comment = await client.stories.findById(gid);
      await webhook.send({
        text: `*${comment.created_by.name}*`,
        attachments: [
          {
            color: '#81848f',
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*<https://app.asana.com/0/${process.env.PROJECT_ID}/${comment.target.gid}/f|${comment.target.name}>*`,
                },
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: comment.text,
                },
              },
            ],
          },
        ],
      });
    }
  });

  app.use(router.routes()).use(router.allowedMethods());

  app.listen(process.env.PORT || 8888);

  let gid = '';
  try {
    const established = await client.webhooks.create(process.env.PROJECT_ID, `${process.env.BASE_URL}/webhook`, {
      filters: [
        {
          action: 'added',
          resource_type: 'story',
        },
      ],
    });
    gid = established.gid;
  } catch (e) {
    console.error(e.value.errors);
    process.exit(1);
  }

  process.on('SIGINT', () => {
    client.webhooks.deleteById(gid).then(() => {
      console.log('Webhook deleted');
      process.exit(0);
    });
  });
}

main();
