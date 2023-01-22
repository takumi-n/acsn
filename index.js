const app = require('./lib/app');

require('dotenv').config();

async function main() {
  const opts = {
    baseUrl: process.env.BASE_URL,
    asanaPat: process.env.ASANA_PAT,
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
    workspaceId: process.env.ASANA_WORKSPACE_ID,
    projectId: process.env.ASANA_PROJECT_ID,
  };

  app(opts).startServer(process.env.PORT || 8080);
}

main();
