import { GenericDatasource } from "./datasource";

class GenericConfigCtrl {
	templateUrl = "partials/config.html";
}
class GenericAnnotationsQueryCtrl {
	templateUrl = "partials/annotations.editor.html";
}

export {
	GenericDatasource as Datasource,
	GenericConfigCtrl as ConfigCtrl,
	GenericAnnotationsQueryCtrl as AnnotationsQueryCtrl
};
