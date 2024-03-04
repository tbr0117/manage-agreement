sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageToast'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageToast) {
        "use strict";

        return Controller.extend("manageagreement.controller.Selection", {
            onInit: function () {

            },

            onGo: function () {
                this.getOwnerComponent().getRouter().navTo('MaterialTable');
            },
            onFilterChange: function (oEvent) {
                var oFilterData = oEvent.getSource().getFilterData();
                var aFilters = [];

                for (var sKey in oFilterData) {
                    if (oFilterData.hasOwnProperty(sKey)) {
                        var sValue = oFilterData[sKey];
                        if (sValue) {
                            if (sValue.items.length > 0) {

                                for (let i = 0; i < sValue.items.length; i++) {

                                    aFilters.push(new sap.ui.model.Filter(sKey, "EQ", sValue.items[i].key));
                                }
                            } else {

                                for (let i = 0; i < sValue.ranges.length; i++) {

                                    aFilters.push(new sap.ui.model.Filter(sKey, sValue.ranges[i].operation, sValue.ranges[i].value1));
                                }
                            }
                        }
                    }
                }
                this.getOwnerComponent().getModel("MainViewModel").setProperty("/FilterData", aFilters);
            }
        });
    });
