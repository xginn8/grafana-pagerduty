interface Response {
    status: string;
    message: string;
    title: string;
}
interface PDResponse {
    data: string;
    message: string;
    title: string;
}
export declare class GenericDatasource {
    constructor(instanceSettings: any, $q: any, backendSrv: any, templateSrv: any);
    testDatasource: () => Response;
    transformResponse(response: PDResponse, options: any): any[];
    annotationQuery(options: any): any;
    getEvents(allResults: any, queryString: any, offset: any, limit: any, options: any): any;
    doRequest(options: any): any;
}
export {};
