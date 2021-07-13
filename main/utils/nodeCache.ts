const NodeCache = require('node-cache');

const nodeCache = new NodeCache({ stdTTL: 5 * 60 });

export default nodeCache;
