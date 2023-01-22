const asana = require('asana');

module.exports = class AsanaClient {
  constructor(pat, workspaceId, projectId, baseUrl) {
    this.pat = pat;
    this.client = asana.Client.create().useAccessToken(pat);
    this.workspaceId = workspaceId;
    this.projectId = projectId;
    this.baseUrl = baseUrl;
    this.webhookGid = undefined;
  }

  async registerWebhook() {
    const established = await this.client.webhooks.create(this.projectId, `${this.baseUrl}/webhook`, {
      filters: [
        {
          action: 'added',
          resource_type: 'story',
        },
      ],
    });

    this.webhookGid = established.gid;
  }

  async deleteExistingWebhook() {
    const webhooks = (await this.client.webhooks.getAll(this.workspaceId, { resource: this.projectId })).data;
    const webhook = webhooks.find((w) => w.target.startsWith(this.baseUrl));
    if (webhook) {
      await this.client.webhooks.deleteById(webhook.gid);
    }

    if (this.gid) {
      await this.client.webhooks.deleteById(this.gid);
    }
  }

  async getComment(gid) {
    const comment = await this.client.stories.findById(gid);
    return comment;
  }
};
