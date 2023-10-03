sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, History, JSONModel, Fragment, MessageBox) {
        "use strict";

        return Controller.extend("at.clouddna.training00.zhoui5.controller.Customer", {
            _fragmentList: {},
            bCreate: false,

            onInit: function () {
                let oEditModel = new JSONModel({
                    editmode: false
                });

                this.getView().setModel(oEditModel, "editModel");

                let oRouter = this.getOwnerComponent().getRouter();
                            
                oRouter.getRoute("RouteCustomer").attachPatternMatched(this._onPatternMatched, this);

                oRouter.getRoute("CreateCustomer").attachPatternMatched(this._onCreatePatternMatched, this);
            },

            _onCreatePatternMatched: function (oEvent) {
                this.bCreate = true;
            
                let oNewCustomerContext = this.getView().getModel().createEntry("/Z_P_CUSTOMER");
                this.getView().bindElement(oNewCustomerContext.getPath());
            
                this.getView().getModel("editModel").setProperty("/editmode", true);
                this._showCustomerFragment("CustomerEdit");
            },

            _showCustomerFragment: function(sFragmentName) {
                let page = this.getView().byId("ObjectPageLayout");
                
                page.removeAllSections();
                
                if(this._fragmentList[sFragmentName]) {
                    page.addSection(this._fragmentList[sFragmentName]);
                } else {
                    Fragment.load({
                        id: this.getView().createId(sFragmentName),
                        name: "at.clouddna.training00.zhoui5.view.fragment." + sFragmentName,
                        controller: this
                    }).then(function(oFragment) {
                        this._fragmentList[sFragmentName] = oFragment;
                        page.addSection(this._fragmentList[sFragmentName]);
                    }.bind(this));
                }
            },

            onEditPressed: function() {
                this._toggleEdit(true);
            },
            
            _toggleEdit: function(bEditMode){
                let oEditModel = this.getView().getModel("editModel");
            
                oEditModel.setProperty("/editmode", bEditMode);
            
                this._showCustomerFragment(bEditMode ? "CustomerEdit" : "CustomerDisplay");
            },
            
            onSavePressed: function () {
                let oModel = this.getView().getModel();
                let oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
                let sSuccessText = this.bCreate ? oResourceBundle.getText("dialog.create.success") : oResourceBundle.getText("dialog.edit.success");
                oModel.submitChanges({
                    success: (oData, response) => {
                        MessageBox.success(sSuccessText, {
                            onClose: () => {
                                if (this.bCreate) {
                                    this.onNavBack();
                                } else {
                                    this._toggleEdit(false);
                                }
                            }
                        });
                    },
                    error: (oError) => {
                        MessageBox.error(oError.message);
                    }
                });
            },
            
            onCancelPressed: function () {
                let oModel = this.getView().getModel();
                oModel.resetChanges().then(() => {
                    if (this.bCreate) {
                        this.onNavBack();
                    } else {
                        this._toggleEdit(false);
                    }
                });
            },

            _onPatternMatched: function(oEvent) {
                let path = oEvent.getParameters().arguments["path"];
                this.getView().bindElement("/" + path);
            },

            genderFormatter: function(sKey) {
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