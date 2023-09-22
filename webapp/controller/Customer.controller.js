sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, History) {
        "use strict";

        return Controller.extend("at.clouddna.training00.zhoui5.controller.Customer", {
            onInit: function () {
                this.getOwnerComponent().getRouter().getRoute("RouteCustomer").attachPatternMatched(this._onPatternMatched, this);
            },

            _onPatternMatched: function(oEvent) {
                let path = oEvent.getParameters().arguments["path"];
                this.getView().bindElement("/customers/" + path);
            },

            genderFormatter: function(sKey){
                let oView = this.getView();
                let oI18nModel = oView.getModel("i18n");
                let oResourceBundle = oI18nModel.getResourceBundle();
                let sText = oResourceBundle.getText(sKey);
                return sText;
            },

            onNavBack: function() {
                if (History.getInstance().getPreviousHash() !== undefined) {
                    window.history.go(-1);
                } else {
                    this.getOwnerComponent().getRouter().navTo("Main");
                }
            }
        });
    });