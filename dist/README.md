# PagerDuty Datasource for Grafana

Annotations-only datasource for PagerDuty events.

## To configure:

Create a v2 PagerDuty API key, following the instructions [here](https://support.pagerduty.com/docs/services-and-integrations)

Paste the key into the `API Key` configuration field for the PagerDuty datasource.

## To use:

Add an annotation to a dashboard normally, selecting the PagerDuty datasource. There are a few filters available to
limit the number of results, or the scope.

### Filter by service ID (optional)
* A PagerDuty service represents something you monitor (like a web service, email service, or database service). It is a
  container for related incidents that associates them with escalation policies. Documentation is available
[here](https://v2.developer.pagerduty.com/v2/page/api-reference#!/Services/get_services)

### Filter by urgency (optional)
* [Urgencies](https://support.pagerduty.com/docs/service-settings#section-enable-urgencies) is a feature which allows you to customize how your team is notified based on the criticality of an incident: incidents can be either high-urgency (requires immediate attention) or low-urgency (it can wait).

### Filter by status (optional)
* PagerDuty incidents can either be `triggered`, `acknowledged`, or `resolved`. Please see the [PagerDuty documentation](https://support.pagerduty.com/docs/incidents)
  for further clarification.
