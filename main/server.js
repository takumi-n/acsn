const webhookHandler = require('./lib/webhookHandler');

require('dotenv').config();

let secret;

async function main() {
  const opts = {
    baseUrl: process.env.BASE_URL,
    asanaPat: process.env.ASANA_PAT,
    slackWebhookUrl: process.env.WEBHOOK_URL,
    workspaceId: process.env.WORKSPACE_ID,
    projectId: process.env.PROJECT_ID,
    storeSecret: (s) => {
      secret = s;
    },
    getSecret: () => secret,
  };
  const handler = webhookHandler(opts);

  handler.startServer(process.env.PORT || 8888);
  handler.startWebhook();
}

main();
