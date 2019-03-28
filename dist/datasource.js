"use strict";

System.register(["lodash"], function (_export, _context) {
  "use strict";

  var _, _createClass, GenericDatasource;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export("GenericDatasource", GenericDatasource = function () {
        function GenericDatasource(instanceSettings, $q, backendSrv, templateSrv) {
          _classCallCheck(this, GenericDatasource);

          this.type = instanceSettings.type;
          this.url = "/api/datasources/proxy/" + instanceSettings.id + "/pagerduty/incidents";
          this.name = instanceSettings.name;
          this.q = $q;
          this.backendSrv = backendSrv;
          this.templateSrv = templateSrv;
        }

        _createClass(GenericDatasource, [{
          key: "testDatasource",
          value: function testDatasource() {
            return this.doRequest({
              url: this.url,
              method: "GET"
            }).then(function (response) {
              if (response.status === 200) {
                return {
                  status: "success",
                  message: "Data source is working",
                  title: "Success"
                };
              }
            }).catch(function (response) {
              return {
                status: "error",
                message: "Data source is not working (code: " + response.status + ")",
                title: "Error"
              };
            });
          }
        }, {
          key: "transformResponse",
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

              var annotation_end = d.status === 'resolved' ? Date.parse(d.last_status_change_at) : Date.now();

              var incident = { annotation: { name: d.id,
                  enabled: true,
                  datasource: "grafana-pagerduty"
                },
                title: d.title,
                time: created_at,
                isRegion: true,
                timeEnd: annotation_end,
                tags: [d.type, d.incident_key, d.incident_number, d.status, d.service.id],
                text: '<a target="_blank" href="' + d.html_url + '">PagerDuty incident page</a>'
              };

              incident.tags = incident.tags.filter(function (el) {
                return el != null;
              });

              result.push(incident);
            }
            return result;
          }
        }, {
          key: "annotationQuery",
          value: function annotationQuery(options) {
            var queryString = "";
            var limit = 100;

            queryString += "&since=" + new Date(options.range.from).toISOString();
            queryString += "&until=" + new Date(options.range.to).toISOString();
            queryString += "&limit=" + limit;

            return this.getEvents([], queryString, 0, limit, options);
          }
        }, {
          key: "getEvents",
          value: function getEvents(allResults, queryString, offset, limit, options) {
            var _this = this;

            queryString += "&offset=" + offset;
            return this.doRequest({
              url: this.url + "?time_zone=UTC" + queryString,
              method: 'GET'
            }).then(function (response) {
              var result = _this.transformResponse(response, options);
              var newResults = allResults.concat(result);
              if (response.data.more) {
                return _this.getEvents(newResults, queryString, limit + offset, limit, options);
              } else {
                return newResults;
              }
            });
          }
        }, {
          key: "doRequest",
          value: function doRequest(options) {
            return this.backendSrv.datasourceRequest(options);
          }
        }]);

        return GenericDatasource;
      }());

      _export("GenericDatasource", GenericDatasource);
    }
  };
});
//# sourceMappingURL=datasource.js.map
