sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/core/syncStyleClass',
    'sap/ui/core/Fragment',
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, syncStyleClass, Fragment, Filter, FilterOperator, MessageBox) {
        "use strict";

        return Controller.extend("at.clouddna.training00.zhoui5.controller.Main", {
            onInit: function () {
                
            },
            
            onDeletePressed: function(oEvent){
                this._delete(oEvent.getParameters().listItem);
            },
            
            _delete: function(oListItem){
                let oModel = this.getView().getModel();
                let oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
                let sPath = oListItem.getBindingContext().getPath();
            
                MessageBox.warning(oResourceBundle.getText("sureToDeleteQuestion"), {
                    title: oResourceBundle.getText("sureToDeleteTitle"),
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: function(oAction){
                        if(MessageBox.Action.YES === oAction){
                            oModel.remove(sPath, {
                                success: (oData, response) => {
                                    MessageBox.success(oResourceBundle.getText("dialog.delete.success"));
                                    oModel.refresh(true);
                                },
                                error: (oError) => {
                                    MessageBox.error(oError.message);
                                }
                            });
                        }
                    }
                });
            },

            genderFormatter: function(sKey){
                let oView = this.getView();
                let oI18nModel = oView.getModel("i18n");
                let oResourceBundle = oI18nModel.getResourceBundle();
                let sText = oResourceBundle.getText(sKey);
                return sText;
            },

            onListItemClicked: function(oEvent) {
                let path = oEvent.getSource().getBindingContext().getPath().substring(1);
                this.getOwnerComponent().getRouter().navTo("RouteCustomer", {path: path});
            },

            onOpenDialog: function (oEvent) {
                var oView = this.getView();
                if (!this._pDialog) {
                    this._pDialog = Fragment.load({
                        id: oView.getId(),
                        name: "at.clouddna.training00.zhoui5.view.fragment.Dialog",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }
    
                this._pDialog.then(function (oDialog) {
                    oDialog.bindElement("/ProductCollection/0");
                    // toggle compact style
                    syncStyleClass("sapUiSizeCompact", oView, oDialog);
                    oDialog.open();
                });
            },
    
            onCloseDialog: function (oEvent) {
                //this.onSearch(this.getView().byId("id_search_field").getValue())
                this._pDialog.then(function (oDialog) {
                    oDialog.close();
                });
            },

            onSearch: function (oEvent) {
                // add filter for search
                var value = oEvent.getSource().getValue();
                var aFilters = new Filter({
                    filters:[
                        new Filter("Firstname", FilterOperator.Contains, value),
                        new Filter("Lastname", FilterOperator.Contains, value),
                        new Filter("Title", FilterOperator.Contains, value),
                        new Filter("Gender", FilterOperator.Contains, value),
                        new Filter("Birthdate", FilterOperator.Contains, value),
                        new Filter("Email", FilterOperator.Contains, value),
                        new Filter("Phone", FilterOperator.Contains, value),
                        new Filter("Email", FilterOperator.Contains, value)
                    ],
                    and: false,
                });
    
                // update list binding
                var oTable = this.byId("main_table");
                var oBinding = oTable.getBinding("items");
                oBinding.filter(aFilters, "Application");
            },

            dateFormatter: function(date) {
                let dateObj = new Date(date);
                return dateObj.getDate() + "." + (dateObj.getMonth() + 1) + "." + dateObj.getFullYear();
            },

            onCreatePressed: function() {
                this.getOwnerComponent().getRouter().navTo("CreateCustomer", null, false);
            }
        });
    });