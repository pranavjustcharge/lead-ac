import NodeCache from "node-cache";

// TTL = 3 days (in seconds)
const cache = new NodeCache({ stdTTL: 259200, checkperiod: 3600 });

export default cache;
