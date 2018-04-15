'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GenericDatasource = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GenericDatasource = exports.GenericDatasource = function () {
  function GenericDatasource(instanceSettings, $q, backendSrv, templateSrv) {
    _classCallCheck(this, GenericDatasource);

    this.type = instanceSettings.type;
    this.url = 'https://api.pagerduty.com/incidents?time_zone=UTC';
    this.name = instanceSettings.name;
    this.q = $q;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;
    this.headers = { 'Accept': 'application/vnd.pagerduty+json;version=2' };
    this.headers['Authorization'] = 'Token token=' + instanceSettings.jsonData.apiKey;
  }

  _createClass(GenericDatasource, [{
    key: 'testDatasource',
    value: function testDatasource() {
      return this.doRequest({
        url: this.url,
        method: 'GET'
      }).then(function (response) {
        if (response.status === 200) {
          return { status: "success", message: "Data source is working", title: "Success" };
        }
      });
    }
  }, {
    key: 'transformResponse',
    value: function transformResponse(response, options) {

      var result = [];
      for (var i = 0; i < response.data.incidents.length; i++) {
        var d = response.data.incidents[i];
        if (options.annotation.serviceId && d.service.id != options.annotation.serviceId) {
          continue;
        }
        if (options.annotation.urgency && d.urgency != options.annotation.urgency) {
          continue;
        }
        if (options.annotation.status && d.status != options.annotation.status) {
          continue;
        }
        var created_at = Date.parse(d.created_at);
        var incident = { annotation: { name: d.id,
            enabled: true,
            datasource: "grafana-pagerduty"
          },
          title: d.title,
          time: created_at,
          tags: [d.type, d.incident_key, d.incident_number, d.status, d.service.id],
          text: d.summary
        };
        result.push(incident);
      }
      return result;
    }
  }, {
    key: 'annotationQuery',
    value: function annotationQuery(options) {
      var _this = this;

      var query = JSON.parse(this.templateSrv.replace(options.annotation.query, {}, 'glob'));

      var queryString = "";

      queryString += "&since=" + new Date(options.range.from).toISOString();
      queryString += "&until=" + new Date(options.range.to).toISOString();

      return this.doRequest({
        url: this.url + queryString,
        method: 'GET'
      }).then(function (response) {
        var result = _this.transformResponse(response, options);
        return result;
      });
    }
  }, {
    key: 'doRequest',
    value: function doRequest(options) {
      options.headers = this.headers;

      return this.backendSrv.datasourceRequest(options);
    }
  }]);

  return GenericDatasource;
}();
//# sourceMappingURL=datasource.js.map
