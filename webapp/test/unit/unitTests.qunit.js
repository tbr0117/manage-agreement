/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"manage-agreement/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
