const db = require('@cyclic.sh/dynamodb');
const collection = db.collection('options');
let localSecret;

module.exports.storeSecret = async function storeSecret(secret) {
  if (process.env.CYCLIC_DB) {
    await collection.set('asanaWebhookSecret', { secret });
  } else {
    localSecret = secret;
  }
};

module.exports.getSecret = async function getSecret() {
  if (process.env.CYCLIC_DB) {
    const item = await collection.get('asanaWebhookSecret');
    if (!item) {
      return null;
    }

    return item.props.secret;
  } else {
    return localSecret;
  }
};
