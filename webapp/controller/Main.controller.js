sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageToast'
], function (Controller, JSONModel, MessageToast) {
    'use strict';
    return Controller.extend("manageagreement.controller.Main", {
        onInit: function () {


            let oSmartTable = this.byId("SmartTable");
            this.getOwnerComponent().getRouter().getRoute('MaterialTable').attachPatternMatched(this._onRouteMatched, this);
            //BTNS MODELS
            const obtnsModel = new JSONModel();
            const obtns = {
                Visible: false,
                TableBusy: true
            };
            obtnsModel.setData(obtns);
            this.getView().setModel(obtnsModel, "oMaterialbtns");
            //EDITING MODELS

        },
        _onRouteMatched: function () {
            let oNewModel = new JSONModel();
            const oMaterialDataModel = new JSONModel();
            const oData = {
                "MaterialUpdatedTable": [],
                "MaterialInsertedTable": [],
                "MaterialDeletedTable": [],
                "TableProperties": [],
                "TableKeyProperties": [],
                "TableColumns": ""

            };
            oMaterialDataModel.setData(oData);

            const oMetaModel = this.getOwnerComponent().getModel().getMetaModel()
            const oEntityType = oMetaModel.getODataEntityType(oMetaModel.getODataEntitySet("y_c_comb_agrmnt").entityType);
            oMaterialDataModel.setProperty("/TableProperties", oEntityType.property);
            oMaterialDataModel.setProperty("/TableKeyProperties", oEntityType.key.propertyRef);
            


            this.getView().setModel(oMaterialDataModel, "oMaterialData");
            let oSmartTable = this.byId("SmartTable");
            oSmartTable.setEditable(false);
            this.onEditorDisplay();
            this.getView().setModel(oNewModel, "oMaterialModel");
            const oFilterModel = this.getOwnerComponent().getModel("MainViewModel");

            const aFilters = oFilterModel.getProperty("/FilterData");
            this.onTableLoad();
            this.getOwnerComponent().getModel().read("/y_c_comb_agrmnt", {
                filters: aFilters,
                success: function (oData) {


                    let oSmartTable = this.byId("SmartTable");
                    const aData = oData.results;
                    aData.map((ofield) => {
                        delete ofield.__metadata;
                        ofield['updkz'] = "";
                    });
                    const aColumns = Object.keys(oData.results[0]).toString();
                    oSmartTable.setInitiallyVisibleFields(aColumns);
                    this.onCloseLoadings();
                    console.log(aData);
                    oNewModel.setData(aData);
                    this.tempArr = jQuery.extend(true, {}, aData);

                }.bind(this),
                error: function (oError) {
                    console.log(oError);
                    this.onCloseLoadings();
                    // Handle error
                }.bind(this)

            });

        },
        onTableLoad: function () {
            this.getOwnerComponent().getModel("MainViewModel").setProperty("/MaterialBtns", {
                "Page": false,
                "Table": true,
                "BtnEnable": false,
            });
        },
        onCloseLoadings: function () {


            this.getOwnerComponent().getModel("MainViewModel").setProperty("/MaterialBtns", {
                "Page": false,
                "Table": false,
                "BtnEnable": true,
            });
        },
        onInitialise: function (oEvent) {

            const oDataModel = this.getOwnerComponent().getModel();
            const oTableProperties = oDataModel.getMetaModel().getODataEntityType("cds_y_sd_comb_agrmnt.y_c_comb_agrmntType");
            const aTableProperty = oTableProperties.property;
            const aTableColumns = [];
            aTableProperty.map((oField) => {
                aTableColumns.push(oField.name);
            });

            this.getView().getModel("oMaterialData").setProperty("/TableColumns", aTableColumns.toString());

            var oTable = oEvent.getSource().getTable();
            var aColumns = oTable.getColumns();
            this.onTableLoad();
            for (var i = 0; i < aColumns.length; i++) {
                var sPath = "oMaterialModel>" + aColumns[i].data("p13nData").columnKey;
                let oDisplay = aColumns[i].getTemplate().getDisplay();
                let oEdit = aColumns[i].getTemplate().getEdit();
                if (aTableProperty[i].type === "Edm.Decimal") {
                    oDisplay.getItems()[0].bindText(sPath);
                    oDisplay.getItems()[1].bindText("oMaterialModel>" + aTableProperty[i].extensions[0].value);
                    oEdit.bindValue(sPath);

                }

                else {
                    oDisplay.bindText(sPath);
                    oEdit.bindValue(sPath);
                }
            }

            oTable.bindRows("oMaterialModel>/");
        },
        onAdd: function () {
            let oModel = this.getView().getModel("oMaterialModel");
            var oTable = this.byId("SmartTable");
            const oData = oModel.getData();
            const aColumns = this.getView().getModel("oMaterialData").getProperty("/TableColumns");
            const oNewRow = this.onNewRow();
            // aColumns.map((sValue) => {
            //     if (sValue === "Rate") {

            //         oNewData[sValue] = '10';
            //     } else if (sValue === "updkz") {

            //         oNewData[sValue] = 'I';
            //     } else {
            //         oNewData[sValue] = '';
            //     }

            // });
            oModel.setData([...oData, oNewRow]);
        },
        onNewRow() {
            const oNewRowData = {};
            const oTableProperties = this.getView().getModel("oMaterialData").getProperty("/TableProperties");
            oTableProperties.map((oField) => {

                oNewRowData[oField.name] = '';

            });
            oNewRowData["updkz"] = "I";
            return oNewRowData;
        },
        onDelete: function () {
            const oModel = this.getView().getModel("oMaterialData");
            const oMaterialModel = this.getView().getModel("oMaterialModel");
            const oModelData = oMaterialModel.oData;
            const oDeletedData = oModel.getProperty("/MaterialDeletedTable");
            const oTable = this.byId("SmartTable");
            const aSelectedIndices = oTable.getTable().getSelectedIndices();
            const aDeletedData = [];
            if (aSelectedIndices.length > 0) {

                for (let i = aSelectedIndices.length - 1; i >= 0; i--) {
                    if (oModelData[aSelectedIndices[i]].updkz !== "I") {
                        oDeletedData.push(oModelData[aSelectedIndices[i]]);

                    }
                    oModelData.splice(aSelectedIndices[i], 1);
                }

                oModel.setProperty("/MaterialDeletedTable", oDeletedData);
                oMaterialModel.setData(oModelData);
            } else {
                MessageToast.show("Selected a row to Delete", {
                    width: "75vw"
                });
            }
        },
        onSave: function () {
            const oMainModel = this.getOwnerComponent().getModel();
            let oModel = this.getView().getModel("oMaterialModel");
            const oChangesModel = this.getView().getModel("oMaterialData");
            const oDeletedData = oChangesModel.getProperty("/MaterialDeletedTable");
            const oUpdatedData = oChangesModel.getProperty("/MaterialUpdatedTable");


            const aTableKeyProperties = this.getView().getModel("oMaterialData").getProperty("/TableKeyProperties");
            const oMaterialdata = oModel.oData;
            const oInsertedData = [];
            oMaterialdata.map((ofield) => {
                delete ofield.__metadata;
                if (ofield['updkz'] === "I") {
                    const bKeyempty = aTableKeyProperties.find((oVal) => {


                        if (ofield[oVal.name] === "") {

                            return true;
                        }
                    });
                    if (!bKeyempty) {
                        oInsertedData.push(ofield);
                    }
                }
            });
            if (oDeletedData.length > 0 || oUpdatedData.length > 0 || oInsertedData.length > 0) {


                this.onTableLoad();

                for (let i = 0; i < oInsertedData.length; i++) {
                    delete oInsertedData[i].updkz;
                    this.getOwnerComponent().getModel().create("/y_c_comb_agrmnt", oInsertedData[i], {
                        method: "POST",
                        success: function (oSucess, omsg) {

                            oChangesModel.setProperty("/MaterialInsertedTable", []);

                            this._onRouteMatched();
                            MessageToast.show("Data Creation Successfully");
                        }.bind(this),
                        error: function (oError) {

                            this.onCloseLoadings();
                            oInsertedData[i]["updkz"] = "I";
                            MessageToast.show("Data Creation Failed");
                        }.bind(this)
                    });
                }
                for (let i = 0; i < oUpdatedData.length; i++) {
                    delete oUpdatedData[i].updkz;
                    const year = oUpdatedData[i]['Datbi'].getFullYear();
                    const month = String(oUpdatedData[i]['Datbi'].getMonth() + 1).padStart(2, '0');
                    const day = String(oUpdatedData[i]['Datbi'].getDate()).padStart(2, '0');
                    const time = year + "-" + month + "-" + day + "T00:00:00";
                    this.getOwnerComponent().getModel().update(`/y_c_comb_agrmnt(KnumaAg='${oUpdatedData[i].KnumaAg}',Kunnr='${oUpdatedData[i].Kunnr}',Matnr='${oUpdatedData[i].Matnr}',Datbi=datetime'${URI.encodeQuery(time)}')`, oUpdatedData[i], {
                        method: "PUT",
                        success: function (oSucess, omsg) {
                            oChangesModel.setProperty("/MaterialUpdatedTable", []);

                            this._onRouteMatched();
                            MessageToast.show("Data Updation Successfully");
                        }.bind(this),
                        error: function (oError) {
                            this.onCloseLoadings();
                            oUpdatedData[i]["updkz"] = "U";
                            MessageToast.show("Data Updation Failed");
                        }.bind(this)
                    });
                }
                for (let i = 0; i < oDeletedData.length; i++) {
                    delete oDeletedData[i].updkz;
                    const year = oDeletedData[i]['Datbi'].getFullYear();
                    const month = String(oDeletedData[i]['Datbi'].getMonth() + 1).padStart(2, '0');
                    const day = String(oDeletedData[i]['Datbi'].getDate()).padStart(2, '0');
                    const time = year + "-" + month + "-" + day + "T00:00:00";
                    this.getOwnerComponent().getModel().remove(`/y_c_comb_agrmnt(KnumaAg='${oDeletedData[i].KnumaAg}',Kunnr='${oDeletedData[i].Kunnr}',Matnr='${oDeletedData[i].Matnr}',Datbi=datetime'${URI.encodeQuery(time)}')`, {
                        method: "DELETE",
                        success: function (oSucess) {

                            oChangesModel.setProperty("/MaterialDeletedTable", []);

                            this._onRouteMatched();
                            MessageToast.show("Data Deleted successfully");
                        }.bind(this),
                        error: function (oError) {
                            this.onCloseLoadings();
                            MessageToast.show("Error Deleting data");
                        }.bind(this)
                    });
                }
            } else {
                MessageToast.show("No Changes Available");
            }

        },
        onEditorDisplay: function (oEvent) {

            let oSmartTable = this.byId("SmartTable");
            const bPaste = oSmartTable.getEnablePaste();
            oSmartTable.setEnablePaste(!bPaste);
            const oModel = this.getView().getModel("oMaterialbtns");
            oModel.setData({
                Visible: oSmartTable.getEditable()
            });
        },
        onFieldChange: function (oEvent1) {
            var tempArr = this.tempArr;
            let oModel = this.getView().getModel("oMaterialModel");
            let sValue = "";
            const aData = oModel.oData;
            const oChangesModel = this.getView().getModel("oMaterialData");
            const oTable = this.byId("SmartTable");

            const aTableProperties = this.getView().getModel("oMaterialData").getProperty("/TableProperties");

            const aTableKeyProperties = this.getView().getModel("oMaterialData").getProperty("/TableKeyProperties");

            const sColumn = oEvent1.getParameters('oParent').changeEvent.getSource().getParent().getEdit().getBindingInfo('value').binding.sPath;
            aTableProperties.map((oField) => {
                if (oField.name === sColumn) {

                    if (oField.type === "Edm.DateTime") {

                        sValue = oEvent1.getParameters('oParent').changeEvent.getSource().getParent().getEdit().getProperty('dateValue');
                    } else {

                        sValue = oEvent1.getParameters('oParent').changeEvent.getSource().getParent().getEdit().getBindingInfo('value').binding.oValue;
                    }
                }
            });
            const bKeyChanged = aTableKeyProperties.find((oVal) => {


                if (oVal.name === sColumn) {

                    return true;
                }
            }
            );
            const sIndex = oEvent1.getParameters('oParent').changeEvent.getSource().getParent().getEdit().getBindingInfo('value').binding.getContext('sPath').sPath.split('/')[1];
            if ((aData[sIndex].updkz === "" || aData[sIndex].updkz === "U") && (bKeyChanged)) {

                aData[sIndex][sColumn] = tempArr[sIndex][sColumn];
                MessageToast.show("Key fields Not Changeable");
            } else {

                if (aData[sIndex].updkz === "" || aData[sIndex].updkz === "U") {
                    aData[sIndex][sColumn] = sValue;
                    aData[sIndex].updkz = "U";
                    const oUpdatedData = aData.filter(oData => oData.updkz === "U");
                    oChangesModel.setProperty("/MaterialUpdatedTable", oUpdatedData);
                } else if (aData[sIndex].updkz === "I") {
                    aData[sIndex][sColumn] = sValue;
                    const oInsertedData = aData.filter(oData => oData.updkz === "I");
                    oChangesModel.setProperty("/MaterialInsertedTable", oInsertedData);

                }
            }
        },
        onPaste: function (oEvent) {
            const oModel = this.getView().getModel("oMaterialModel");
            const aData = oModel.getData();
            let oSmartTable = this.byId("SmartTable");

            const oChangesModel = this.getView().getModel("oMaterialData");
            let oTable = oSmartTable.getTable();
            const oEventData = oEvent.getParameters("results").result;

            if (oEventData.errors !== null) {
                let oResult = oEvent.getParameter("result");//JSON.stringify(oResult.errors)
                MessageToast.show("Paste result:" + "Binding is Not Supported", {
                    width: "75vw"
                });
            } else {

                const tabindex = $(`#${oEvent.mParameters.id} tbody td[tabindex=0]`)[0]?.parentElement?.rowIndex - 1;
                let cellIndex = oTable.getRows()[tabindex]?.oBindingContexts?.oMaterialModel.sPath.split('/')[1];
                const oPasteData = oEventData.parsedData;
                const oParsedLength = oPasteData.length;
                for (let i = 0; i < oParsedLength; i++) {
                    const oUpadateData = oPasteData[i];
                    if (cellIndex < aData.length) {
                        if (aData[cellIndex].updkz === "") {
                            aData[cellIndex].updkz = "U";
                        }
                        aData[cellIndex] = { ...aData[cellIndex], ...oUpadateData };
                        cellIndex++;
                    }
                    else {
                        const aColumns = this.getView().getModel("oMaterialData").getProperty("/TableColumns");
                        let oNewData = this.onNewRow();
                        oNewData = { ...oNewData, ...oUpadateData };
                        aData.push(oNewData);
                        cellIndex++;
                    }
                }

                const oUpdatedData = aData.filter(oData => oData.updkz === "U");
                oChangesModel.setProperty("/MaterialUpdatedTable", oUpdatedData);
                const oInsertedData = aData.filter(oData => oData.updkz === "I");
                oChangesModel.setProperty("/MaterialInsertedTable", oInsertedData);
                oModel.setData(aData);
            }
        },
        onBeforePaste: function (oEvent) {
            let oSmartTable = this.byId("SmartTable");
            const tabindex = $(`#${oEvent.mParameters.id} tbody td[tabindex=0]`)[0];
            if (tabindex === undefined) {
                MessageToast.show("Select a Cell to Paste");
            } else {

                const oAttribute = sap.ui.getCore().byId(tabindex.getAttribute('data-sap-ui-colid'));
                const name = oAttribute.getProperty("filterProperty");
                oEvent.mParameters.columnInfos.find((col) => { if (col.property == name) { return true; } col.ignore = true; });
                const colIndex = oEvent.mParameters.columnInfos.findIndex((col) => col.property == name);
                oEvent.mParameters.columnInfos.splice(0, colIndex);
            }

            console.log(oEvent);
        },
        onDiscard: function () {

            const oChangesModel = this.getView().getModel("oMaterialData");
            const oDeletedData = oChangesModel.getProperty("/MaterialDeletedTable");
            const oUpdatedData = oChangesModel.getProperty("/MaterialUpdatedTable");
            const oInsertedData = oChangesModel.getProperty("/MaterialInsertedTable");
            if (oDeletedData.length > 0 || oUpdatedData.length > 0 || oInsertedData.length > 0) {
                const oData = {
                    "MaterialUpdatedTable": [],
                    "MaterialInsertedTable": [],
                    "MaterialDeletedTable": []
                };
                this.getView().setModel("oMaterialData", oData);
                this._onRouteMatched();
            } else {
                MessageToast.show("No Changes Available");
            }
        }
    });
});