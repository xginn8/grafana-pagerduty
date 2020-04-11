export interface GrafanaTestResponse {
	message: string;
	status: string;
	title: string;
}

export interface Options {
	annotation: Annotation;
	range: Range;
}

export interface Range {
	from: string;
	to: string;
}

//enum Urgency {
//	LOW = "low",
//	HIGH = "high"
//}
//
//enum AnnotationStatus {
//	RESOLVED = "resolved",
//	ACKNOWLEDGED = "acknowledged",
//	TRIGGERED = "triggered"
//}

export interface Annotation {
	serviceId?: string;
	urgency?: string;
	status?: string;
}

interface PDResponse {
	data: string;
	message: string;
	title: string;
}

export class GenericDatasource {
	backendSrv: any;
	name: string;
	q: any;
	templateSrv: any;
	type: string;
	url: string;
	constructor(instanceSettings, $q, backendSrv, templateSrv) {
		this.type = instanceSettings.type;
		this.url = `/api/datasources/proxy/${instanceSettings.id}/pagerduty/incidents`;
		this.name = instanceSettings.name;
		this.q = $q;
		this.backendSrv = backendSrv;
		this.templateSrv = templateSrv;
	}

	testDatasource = (): GrafanaTestResponse => {
		return this.doRequest({
			url: this.url,
			method: "GET"
		})
			.then(response => {
				if (response.status === 200) {
					return {
						status: "success",
						message: "Data source is working",
						title: "Success"
					};
				}
			})
			.catch(response => {
				return {
					status: "error",
					message: `Data source is not working (code: ${response.status})`,
					title: "Error"
				};
			});
	};

	transformResponse = (response, options: Options) => {
		const result = [];
		// TODO fix up this loop
		for (let i = 0; i < response.data.incidents.length; i++) {
			const d = response.data.incidents[i];
			if (options.annotation.serviceId && d.service.id != options.annotation.serviceId) {
				continue;
			}
			if (options.annotation.urgency && d.urgency != options.annotation.urgency) {
				continue;
			}
			if (options.annotation.status && d.status != options.annotation.status) {
				continue;
			}
			const created_at = Date.parse(d.created_at);

			const annotation_end = d.status === "resolved" ? Date.parse(d.last_status_change_at) : Date.now();

			const incident = {
				annotation: {
					name: d.id,
					enabled: true,
					datasource: "grafana-pagerduty"
				},
				title: d.title,
				time: created_at,
				isRegion: true,
				timeEnd: annotation_end,
				tags: [d.type, d.incident_key, d.incident_number, d.status, d.service.id],
				text: `<a target="_blank" href="${d.html_url}">PagerDuty incident page</a>`
			};

			incident.tags = incident.tags.filter(el => {
				return el != null;
			});

			result.push(incident);
		}
		return result;
	};

	annotationQuery = (options: Options) => {
		const limit = 100;

		const queryString = `&since=${new Date(options.range.from).toISOString()}&until=${new Date(
			options.range.to
		).toISOString()}&limit=${limit}`;
		return this.getEvents([], queryString, 0, limit, options);
	};

	getEvents = (allResults, queryString: string, offset: number, limit: number, options: Options) => {
		queryString += `&offset=${offset}`;
		return this.doRequest({
			url: `${this.url}?time_zone=UTC${queryString}`,
			method: "GET"
		}).then(response => {
			const result = this.transformResponse(response, options);
			const newResults = allResults.concat(result);
			if (response.data.more) {
				return this.getEvents(newResults, queryString, limit + offset, limit, options);
			} else {
				return newResults;
			}
		});
	};

	doRequest = options => {
		return this.backendSrv.datasourceRequest(options);
	};
}
