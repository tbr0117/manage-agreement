/*global QUnit*/

sap.ui.define([
	"manage-agreement/controller/Selection.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Selection Controller");

	QUnit.test("I should test the Selection controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
