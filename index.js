const webhookApp = require('./lib/webhookApp');

require('dotenv').config();

async function main() {
  const opts = {
    baseUrl: process.env.BASE_URL,
    asanaPat: process.env.ASANA_PAT,
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
    workspaceId: process.env.ASANA_WORKSPACE_ID,
    projectId: process.env.ASANA_PROJECT_ID,
  };
  const app = webhookApp(opts);

  app.startServer(process.env.PORT || 8080);
  app.startWebhook();
}

main();
