const NodeCache = require('node-cache');

const nodeCache = new NodeCache({ stdTTL: 3 * 60 });

export default nodeCache;
