sap.ui.define([
    "at/clouddna/training00/zhoui5/controller/BaseController",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "at/clouddna/training00/zhoui5/controller/formatter/HOUI5Formatter",
    "sap/ui/core/Item"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, History, JSONModel, Fragment, MessageBox, HOUI5Formatter, Item) {
        "use strict";

        return BaseController.extend("at.clouddna.training00.zhoui5.controller.Customer", {
            formatter: HOUI5Formatter,

            _fragmentList: {},
            bCreate: false,

            onInit: function () {
                this.setContentDensity();

                let oEditModel = new JSONModel({
                    editmode: false
                });

                this.getView().setModel(oEditModel, "editModel");

                let oRouter = this.getOwnerComponent().getRouter();

                oRouter.getRoute("RouteCustomer").attachPatternMatched(this._onPatternMatched, this);

                oRouter.getRoute("CreateCustomer").attachPatternMatched(this._onCreatePatternMatched, this);
            },

            _onPatternMatched: function(oEvent) {
                let sPath = oEvent.getParameters().arguments.path;
                this.sCustomerPath = decodeURIComponent(sPath);
                this.getView().bindElement(this.sCustomerPath);

                this._showCustomerFragment("CustomerDisplay");
            },

            _onCreatePatternMatched: function (oEvent) {
                this.bCreate = true;
            
                let oNewCustomerContext = this.getView().getModel().createEntry("/Z_P_CUSTOMER");
                this.getView().bindElement(oNewCustomerContext.getPath());
            
                this.getView().getModel("editModel").setProperty("/editmode", true);
                this._showCustomerFragment("CustomerEdit");
            },

            _toggleEdit: function(bEditMode){
                let oEditModel = this.getView().getModel("editModel");
            
                oEditModel.setProperty("/editmode", bEditMode);
            
                this._showCustomerFragment(bEditMode ? "CustomerEdit" : "CustomerDisplay");
            },

            _showCustomerFragment: function(sFragmentName) {
                let page = this.getView().byId("cust_objectpagelayout");
                
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

            onOpenAttachments: function(oEvent) {
                let oView = this.getView();
            
                if (!this._pDialog) {
                    this._pDialog = Fragment.load({
                        id: oView.getId(),
                        name: "at.clouddna.training00.zhoui5.view.fragment.AttachmentDialog",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }
              
                this._pDialog.then(function (oDialog) {
                    oDialog.open();
                }.bind(this));
            },

            onAfterItemAdded: function(oEvent){
                const oUploadSet = this.getView().byId("attachments_uploadset");
                const oUploadSetItem = oEvent.getParameters().item;
                const sFileName = oUploadSetItem.getFileName();
            
                oUploadSet.removeAllHeaderFields();

                let sPath = this.getView().getBindingContext().sPath;
                this.getView().setBusy(true);
                this.getView().getModel().create(sPath + "/to_CustomerDocument", {
                    Documenttype: oUploadSetItem.getMediaType(),
                    Documentname: oUploadSetItem.getFileName(),
                }, {
                    success: (data, response)=>{
                        this.getView().setBusy(false);
                        console.log(data);
                        console.log(response);
                       
                        oUploadSet.addHeaderField(new Item({
                            key: "X-CSRF-Token",
                            text: this.getView().getModel().getSecurityToken()
                        }));

                        oUploadSet.setUploadUrl("proxy/" + data.__metadata.uri + "/Documentcontent");
                        
                        oUploadSet.setHttpRequestMethod("PUT");

                        /*oUploadSet.addHeaderField(new Item({
                            key: "Content-Disposition",
                            text: `attachment; Documentname=${oUploadSetItem.getFileName()}`
                        }));*/

                        oUploadSet.uploadItem(oUploadSetItem);
                    },
                    error: (oError)=>{
                        this.getView().setBusy(false);
                        MessageBox.error(oError.message);
                    }
                });
            },

            formatUrl: function(sDocId, sCustomerId){
                let sPath = this.getView().getModel().createKey("/Z_C_CUSTOMERDOCUMENT", {
                    Documentid: sDocId,
                    Customerid: sCustomerId
                });
                return this.getView().getModel().sServiceUrl + sPath + "/$value";
            },

            onUploadCompleted: function(){
                this.getView().getModel().refresh(true);
            },
            
            onRemovePressed: function(oEvent){
                oEvent.preventDefault();

                const oModel = this.getView().getModel();
                const sPath = oEvent.getSource().getBindingContext().getPath();

                this.getView().setBusy(true);
                this.getView().getModel().remove(sPath, {
                    success: (oData, response)=>{
                        this.getView().setBusy(false);
                        MessageBox.success(this.getLocalizedText("dialog.delete.success"));
                        oModel.refresh(true);
                    },
                    error: (oError)=>{
                        this.getView().setBusy(false);
                        MessageBox.error(oError.message);
                    }
                });
            },
            
            onAttachmentsDialogClose: function(){
                this._pDialog.then(function(oDialog){
                    oDialog.close();
                }.bind(this));
            },

            onEditPressed: function() {
                this._toggleEdit(true);
            },
            
            onSavePressed: function () {
                let oModel = this.getView().getModel();
                let sSuccessText = this.bCreate ? this.getLocalizedText("dialog.create.success") : this.getLocalizedText("dialog.edit.success");
                oModel.submitChanges({
                    success: (oData, response) => {
                        MessageBox.success(sSuccessText, {
                            onClose: () => {
                                if (this.bCreate) {
                                    oModel.refresh(true);
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

            genderFormatter: function(sKey) {
                let oView = this.getView();
                let oI18nModel = oView.getModel("i18n");
                let sText = this.getLocalizedText(sKey);
                return sText;
                
            },

            dateFormatter: function(date) {
                let dateObj = new Date(date);
                return dateObj.getDate() + "." + (dateObj.getMonth() + 1) + "." + dateObj.getFullYear();
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