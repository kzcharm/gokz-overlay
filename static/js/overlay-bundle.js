var overlay = (function (exports, config, template) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var config__default = /*#__PURE__*/_interopDefaultLegacy(config);
  var template__default = /*#__PURE__*/_interopDefaultLegacy(template);

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
    return target;
  }
  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }
    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }
  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
        args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);
        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }
        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }
        _next(undefined);
      });
    };
  }
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  var version = "3.0.5";

  class Logger {
    constructor(options) {
      this.enableDebug = options.enableDebug;
    }
    DoDebug(msg, obj) {
      if (this.enableDebug) {
        this.DoLog(msg, obj, "DEBUG");
      }
    }
    DoError(msg, obj) {
      this.DoLog(msg, obj, "ERROR");
    }
    DoInfo(msg, obj) {
      this.DoLog(msg, obj, "INFO");
    }
    DoLog(msg, obj, prefix) {
      console.log("%c[%s] %c(%s) %c%s", "font-size: 14px; color: cyan", prefix, "font-size: 10px; color: gray", new Date().toLocaleString(), "font-size: 12px; color: white", msg, obj === undefined ? "" : {
        obj
      });
    }
  }

  var getCacheEntry = key => {
    var data = sessionStorage.getItem(key);
    if (!data) {
      return null;
    }
    return JSON.parse(data);
  };
  var setCacheEntry = (key, value, lifetimeSeconds) => {
    sessionStorage.setItem(key, JSON.stringify({
      data: value,
      expires: Math.floor(Date.now() / 1000) + lifetimeSeconds
    }));
  };
  var removeCacheEntry = key => {
    sessionStorage.removeItem(key);
  };
  var isExpiredCacheEntry = entry => {
    if (!entry) {
      return true;
    }
    return entry.expires < Math.floor(Date.now() / 1000);
  };
  var removeExpiredCacheEntries = () => {
    var cacheKeys = Object.keys(sessionStorage);
    var secondsNow = Math.floor(Date.now() / 1000);
    for (var key of cacheKeys) {
      var entry = getCacheEntry(key);
      var expiredSeconds = Math.abs(secondsNow - entry.expires);

      // 5 minutes
      if (expiredSeconds >= 300) {
        removeCacheEntry(key);
      }
    }
  };

  class ApiHTTPClient {
    constructor(options) {
      this.options = {
        logger: options.logger,
        fetch: options.fetchOptions,
        client: options.clientOptions
      };
      this.controller = new AbortController();
      this.options.fetch = _objectSpread2(_objectSpread2({}, this.options.fetch), {}, {
        signal: this.controller.signal
      });
    }
    getMapByName(mapName) {
      return cachedFetch("/maps/name/".concat(mapName), this.options);
    }
    getTpWorldRecord(mapName, modeName) {
      return cachedFetch("/records/top", this.options, {
        limit: 1,
        stage: 0,
        tickrate: 128,
        map_name: mapName,
        has_teleports: true,
        modes_list_string: modeName
      });
    }
    getTpPersonalBest(mapName, modeName, steamId64) {
      return cachedFetch("/records/top", this.options, {
        stage: 0,
        limit: 1,
        tickrate: 128,
        map_name: mapName,
        steamId64: steamId64,
        has_teleports: true,
        modes_list_string: modeName
      });
    }
    getProWorldRecord(mapName, modeName) {
      return cachedFetch("/records/top", this.options, {
        limit: 1,
        stage: 0,
        tickrate: 128,
        map_name: mapName,
        has_teleports: false,
        modes_list_string: modeName
      });
    }
    getProPersonalBest(mapName, modeName, steamId64) {
      return cachedFetch("/records/top", this.options, {
        stage: 0,
        limit: 1,
        tickrate: 128,
        map_name: mapName,
        steamId64: steamId64,
        has_teleports: false,
        modes_list_string: modeName
      });
    }
    abortInflightRequests() {
      this.controller.abort();
      this.controller = new AbortController();
      this.options.fetch.signal = this.controller.signal;
    }
  }
  var cachedFetch = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator(function* (url, options, queryParams) {
      var _options$logger2;
      url = new URL(options.client.baseUrl + url);
      if (queryParams) {
        url.search = new URLSearchParams(queryParams);
      }
      var cacheKey = url.toString();
      var cacheEntry = getCacheEntry(cacheKey);
      if (!isExpiredCacheEntry(cacheEntry)) {
        var _options$logger;
        (_options$logger = options.logger) === null || _options$logger === void 0 ? void 0 : _options$logger.DoDebug("HTTP cache hit!", {
          cacheKey,
          cacheEntry
        });
        return cacheEntry.data;
      }
      (_options$logger2 = options.logger) === null || _options$logger2 === void 0 ? void 0 : _options$logger2.DoDebug("HTTP cache miss!", {
        cacheKey
      });
      try {
        var _options$logger3;
        var response = yield fetch(url, options.fetch);
        if (!response.ok) {
          return undefined;
        }
        var data = yield response.json();
        (_options$logger3 = options.logger) === null || _options$logger3 === void 0 ? void 0 : _options$logger3.DoDebug("HTTP success", {
          url,
          data
        });
        setCacheEntry(cacheKey, data, options.client.cacheLifetime);
        return data;
      } catch (err) {
        var _options$logger4;
        // probably abort?
        (_options$logger4 = options.logger) === null || _options$logger4 === void 0 ? void 0 : _options$logger4.DoError("HTTP error", err);
        return null;
      }
    });
    return function cachedFetch(_x, _x2, _x3) {
      return _ref.apply(this, arguments);
    };
  }();

  function getMapPrefix(mapName) {
    return mapName.includes("_") ? mapName.split("_")[0] : "";
  }
  function getMapPrettyName(fullMapName) {
    return fullMapName.split("/").pop();
  }

  var logger = new Logger({
    enableDebug: config__default["default"].debugMode
  });
  var apiClient = new ApiHTTPClient({
    logger: logger,
    clientOptions: {
      baseUrl: config__default["default"].apiClientBaseUrl,
      cacheLifetime: config__default["default"].apiClientCacheLifetime
    }
  });
  logger.DoInfo("kz-map-overlay v".concat(version));
  setInterval(removeExpiredCacheEntries, 60000);
  var app = new Vue({
    el: "#overlay",
    template: template__default["default"],
    data() {
      return {
        config: config__default["default"],
        fetchTimer: null,
        map: null,
        tpWr: null,
        tpPb: null,
        proWr: null,
        proPb: null,
        steamId: "",
        mapName: config__default["default"].defaultMapName,
        modeName: config__default["default"].defaultModeName
      };
    },
    watch: {
      mapName: "onMapChange",
      modeName: "onModeChange"
    },
    mounted() {
      this.mapName = this.config.defaultMapName;
      this.modeName = this.config.defaultModeName;
      if (this.config.debugMode) {
        this.steamId = this.config.debugPlayer;
      }
      if (this.config.wsEndpoint) {
        var ws = new WebSocket(this.config.wsEndpoint, this.config.wsProtocols);
        ws.onopen = evt => {
          ws.send(""); // GSISocket requires this
          logger.DoInfo("WebSocket connected", {
            ws,
            evt
          });
        };
        ws.onclose = evt => {
          logger.DoInfo("WebSocket disconnected", {
            ws,
            evt
          });
        };
        ws.onmessage = evt => {
          var _data$player, _data$map$name, _data$map, _data$player2, _data$player2$clan$ma;
          var data = JSON.parse(evt.data);
          logger.DoDebug("Websocket data received", {
            ws,
            data
          });
          this.steamId = data === null || data === void 0 ? void 0 : (_data$player = data.player) === null || _data$player === void 0 ? void 0 : _data$player.steamid;
          this.mapName = getMapPrettyName((_data$map$name = data === null || data === void 0 ? void 0 : (_data$map = data.map) === null || _data$map === void 0 ? void 0 : _data$map.name) !== null && _data$map$name !== void 0 ? _data$map$name : this.config.defaultMapName);
          var clan = data === null || data === void 0 ? void 0 : (_data$player2 = data.player) === null || _data$player2 === void 0 ? void 0 : (_data$player2$clan$ma = _data$player2.clan.match(/^\[([A-Z]{3})/)) === null || _data$player2$clan$ma === void 0 ? void 0 : _data$player2$clan$ma[1];
          this.modeName = this.config.validKzModes.includes(clan) ? clan : config__default["default"].defaultModeName;
        };
      }
    },
    computed: {
      mapPrefix: function mapPrefix() {
        return getMapPrefix(this.mapName).toLowerCase();
      },
      mapIsKz: function mapIsKz() {
        return this.config.validKzMapPrefixes.includes(this.mapPrefix);
      },
      globalMode: function globalMode() {
        return this.config.validKzGlobalModes[this.modeName];
      },
      nubWr: function nubWr() {
        var _this$proWr, _this$tpWr;
        if (this.tpWr === undefined || this.proWr === undefined) {
          return undefined;
        }
        return ((_this$proWr = this.proWr) === null || _this$proWr === void 0 ? void 0 : _this$proWr.time) <= ((_this$tpWr = this.tpWr) === null || _this$tpWr === void 0 ? void 0 : _this$tpWr.time) ? this.proWr : this.tpWr;
      },
      nubPb: function nubPb() {
        var _this$proPb, _this$tpPb;
        if (this.tpPb === undefined || this.proPb === undefined) {
          return undefined;
        }
        return ((_this$proPb = this.proPb) === null || _this$proPb === void 0 ? void 0 : _this$proPb.time) <= ((_this$tpPb = this.tpPb) === null || _this$tpPb === void 0 ? void 0 : _this$tpPb.time) ? this.proPb : this.tpPb;
      }
    },
    methods: {
      resetState: function resetState(isMapChange) {
        clearTimeout(this.fetchTimer);
        apiClient.abortInflightRequests();
        if (isMapChange) {
          this.map = this.mapIsKz ? undefined : null;
        }
        this.invalidateRecords();
      },
      invalidateRecords: function invalidateRecords() {
        var state = this.mapIsKz && this.globalMode ? undefined : null;
        this.tpWr = state;
        this.tpPb = state;
        this.proWr = state;
        this.proPb = state;
      },
      queueDataFetch: function queueDataFetch() {
        clearTimeout(this.fetchTimer);
        if (this.config.dataFetchInterval) {
          this.fetchTimer = setTimeout(this.fetchData, this.config.dataFetchInterval * 1000);
        }
      },
      onMapChange: function onMapChange() {
        logger.DoDebug("Map changed!");
        this.resetState(true);
        this.fetchData();
      },
      onModeChange: function onModeChange() {
        logger.DoDebug("Mode changed!");
        this.resetState(false);
        this.fetchData();
      },
      fetchData: function () {
        var _fetchData = _asyncToGenerator(function* () {
          var _this$map, _wrs$0$, _wrs$, _wrs$1$, _wrs$2, _pbs$0$, _pbs$, _pbs$1$, _pbs$2;
          if (!this.mapIsKz) {
            return;
          }
          this.map = yield apiClient.getMapByName(this.mapName);
          if (this.map === undefined) {
            return this.queueDataFetch();
          }
          if (!((_this$map = this.map) !== null && _this$map !== void 0 && _this$map.validated)) {
            this.tpWr = null;
            this.tpPb = null;
            this.proWr = null;
            this.proPb = null;
            return;
          }
          if (!this.globalMode) {
            return;
          }
          var map = this.mapName;
          var mode = this.globalMode;
          var steamId = this.steamId;
          var wrs = yield Promise.all([apiClient.getTpWorldRecord(map, mode), apiClient.getProWorldRecord(map, mode)]);
          this.tpWr = (_wrs$0$ = (_wrs$ = wrs[0]) === null || _wrs$ === void 0 ? void 0 : _wrs$[0]) !== null && _wrs$0$ !== void 0 ? _wrs$0$ : null;
          this.proWr = (_wrs$1$ = (_wrs$2 = wrs[1]) === null || _wrs$2 === void 0 ? void 0 : _wrs$2[0]) !== null && _wrs$1$ !== void 0 ? _wrs$1$ : null;
          var pbs = yield Promise.all([this.tpWr ? apiClient.getTpPersonalBest(map, mode, steamId) : null, this.proWr ? apiClient.getProPersonalBest(map, mode, steamId) : null]);
          this.tpPb = (_pbs$0$ = (_pbs$ = pbs[0]) === null || _pbs$ === void 0 ? void 0 : _pbs$[0]) !== null && _pbs$0$ !== void 0 ? _pbs$0$ : null;
          this.proPb = (_pbs$1$ = (_pbs$2 = pbs[1]) === null || _pbs$2 === void 0 ? void 0 : _pbs$2[0]) !== null && _pbs$1$ !== void 0 ? _pbs$1$ : null;
          return this.queueDataFetch();
        });
        function fetchData() {
          return _fetchData.apply(this, arguments);
        }
        return fetchData;
      }()
    }
  });

  exports.app = app;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({}, overlayConfig, overlayTemplate);
