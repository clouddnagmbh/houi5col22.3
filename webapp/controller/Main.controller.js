sap.ui.define([
    "at/clouddna/training00/zhoui5/controller/BaseController",
    'sap/ui/core/syncStyleClass',
    'sap/ui/core/Fragment',
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, syncStyleClass, Fragment, Filter, FilterOperator, MessageBox) {
        "use strict";

        return BaseController.extend("at.clouddna.training00.zhoui5.controller.Main", {
            onInit: function () {
                this.setContentDensity();

                //this.getView().setModel(this.getOwnerComponent().getModel('cdsModel'));
                //this.getView().byId("main_smarttable").rebindTable();
            },
            
            onDeletePressed: function(oEvent){
                this._delete(oEvent.getParameters().listItem);
            },
            
            _delete: function(oListItem){
                let oModel = this.getView().getModel();
                //let oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
                let sPath = oListItem.getBindingContext().getPath();
            
                MessageBox.warning(this.getLocalizedText("sureToDeleteQuestion"), {
                    title: this.getLocalizedText("sureToDeleteTitle"),
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: (oAction)=>{
                        if(MessageBox.Action.YES === oAction){
                            oModel.remove(sPath, {
                                success: (oData, response) => {
                                    MessageBox.success(this.getLocalizedText("dialog.delete.success"));
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

            onListItemClicked: function(oEvent) {
                //let path = oEvent.getSource().getBindingContext().getPath().split("'")[1];
                //this.getRouter().navTo("RouteCustomer", {path: path});

                let sPath = oEvent.getSource().getBindingContext().getPath();
                //let oRouter = this.getOwnerComponent().getRouter();
                this.getRouter().navTo("RouteCustomer", {
                    path: encodeURIComponent(sPath)
                });
            },

            genderFormatter: function(sKey){
                let oView = this.getView();
                let oI18nModel = oView.getModel("i18n");
                //let oResourceBundle = oI18nModel.getResourceBundle();
                let sText = this.getLocalizedText(sKey);
                return sText;
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