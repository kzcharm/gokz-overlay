
const pathParts = window.location.pathname.split('/');
const userId = pathParts.pop() || pathParts.pop(); // Handles trailing slash

const overlayConfig = {
  debugMode: false,
  debugPlayer: "-1",

  defaultMapName: "Unknown map",
  defaultModeName: "KZT",

  preferNubTimes: false,

  wsEndpoint: `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/${userId}`,
  wsProtocols: [],

  dataFetchInterval: 30,

  componentsToLoad: ["debug.vue.js", "record.vue.js"],

  apiClientBaseUrl: "https://kztimerglobal.com/api/v2.0",
  apiClientCacheLifetime: 25,

  validKzModes: ["KZT", "SKZ", "VNL", "FKZ", "HKZ"],
  validKzMapPrefixes: ["kz", "xc", "bkz", "skz", "vnl", "kzpro"],

  validKzGlobalModes: {
    KZT: "kz_timer",
    SKZ: "kz_simple",
    VNL: "kz_vanilla",
  },
};