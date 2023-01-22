const webhookHandler = require('./lib/webhookHandler');
const db = require('@cyclic.sh/dynamodb');

require('dotenv').config();

async function main() {
  const collection = db.collection('options');
  const opts = {
    baseUrl: process.env.BASE_URL,
    asanaPat: process.env.ASANA_PAT,
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
    workspaceId: process.env.ASANA_WORKSPACE_ID,
    projectId: process.env.ASANA_PROJECT_ID,
    storeSecret: (secret) => collection.set('asanaWebhookSecret', { secret }),
    getSecret: () => collection.get('asanaWebhookSecret').then((s) => s.props.secret),
  };
  const handler = webhookHandler(opts);

  handler.startServer(process.env.PORT || 8888);
  handler.startWebhook();
}

main();
