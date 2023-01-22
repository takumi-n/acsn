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
    const secret = await collection.get('asanaWebhookSecret').then((s) => s.props.secret);
    return secret;
  } else {
    return localSecret;
  }
};
