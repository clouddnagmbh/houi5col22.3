sap.ui.define([
    "at/clouddna/training00/zhoui5/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "at/clouddna/training00/zhoui5/controller/formatter/HOUI5Formatter",
    "sap/ui/core/Item"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, JSONModel, Fragment, MessageBox, HOUI5Formatter, Item) {
        "use strict";

        return BaseController.extend("at.clouddna.training00.zhoui5.controller.Customer", {
            formatter: HOUI5Formatter,

            _fragmentList: {},
            bCreate: false,

            onInit: function () {
                const oRouter = this.getOwnerComponent().getRouter();
                const oEditModel = new JSONModel({
                    editmode: false
                });

                this.setContentDensity();

                this.getView().setModel(oEditModel, "editModel");

                oRouter.getRoute("RouteCustomer").attachPatternMatched(this._onPatternMatched, this);
                oRouter.getRoute("CreateCustomer").attachPatternMatched(this._onCreatePatternMatched, this);
            },

            _onPatternMatched: function(oEvent) {
                const sPath = oEvent.getParameters().arguments.path;

                this.sCustomerPath = decodeURIComponent(sPath);
                this.getView().bindElement(this.sCustomerPath);

                this._showCustomerFragment("CustomerDisplay");
            },

            _onCreatePatternMatched: function (oEvent) {
                const oNewCustomerContext = this.getView().getModel().createEntry("/Z_P_CUSTOMER");
                const oEditModel = this.getView().getModel("editModel");
                
                this.bCreate = true;
                
                this.getView().bindElement(oNewCustomerContext.getPath());
            
                oEditModel.setProperty("/editmode", true);

                this._showCustomerFragment("CustomerEdit");
            },

            _toggleEdit: function(bEditMode){
                const oEditModel = this.getView().getModel("editModel");
            
                oEditModel.setProperty("/editmode", bEditMode);
            
                this._showCustomerFragment(bEditMode ? "CustomerEdit" : "CustomerDisplay");
            },

            _showCustomerFragment: function(sFragmentName) {
                const page = this.getView().byId("cust_objectpagelayout");
                
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
                if (!this._pDialog) {
                    this._pDialog = Fragment.load({
                        id: this.getView().getId(),
                        name: "at.clouddna.training00.zhoui5.view.fragment.AttachmentDialog",
                        controller: this
                    }).then((oDialog)=>{
                        this.getView().addDependent(oDialog);
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
                const sPath = this.getView().getBindingContext().sPath;
            
                oUploadSet.removeAllHeaderFields();

                this.getView().setBusy(true);

                this.getView().getModel().create(sPath + "/to_CustomerDocument", {}, {
                    success: (oData, response)=>{
                        this.getView().setBusy(false);
                       
                        oUploadSet.addHeaderField(new Item({
                            key: "X-CSRF-Token",
                            text: this.getView().getModel().getSecurityToken()
                        }));

                        oUploadSet.addHeaderField(new Item({
                            key: "Content-Disposition",
                            text: `filename=${oUploadSetItem.getFileName()}`
                        }));

                        oUploadSet.setUploadUrl(`${this.getModel().sServiceUrl}/Z_C_CUSTOMERDOCUMENT(guid'${oData.Documentid}')/$value`);
                        
                        oUploadSet.setHttpRequestMethod("PUT");

                        oUploadSet.uploadItem(oUploadSetItem);
                    },
                    error: (oError)=>{
                        this.getView().setBusy(false);
                        MessageBox.error(oError.message);
                    }
                });
            },

            formatUrl: function(sDocumentid){
                const sPath = this.getView().getModel().createKey("/Z_C_CUSTOMERDOCUMENT", {
                    Documentid: sDocumentid
                });

                return this.getView().getModel().sServiceUrl + sPath + "/$value";
            },

            onUploadCompleted: function(){
                this.getView().setBusy(false);
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
                const oModel = this.getView().getModel();
                const sSuccessText = this.bCreate ? this.getLocalizedText("dialog.create.success") : this.getLocalizedText("dialog.edit.success");

                this.getView().setBusy(true);

                oModel.submitChanges({
                    success: (oData, response) => {
                        this.getView().setBusy(false);

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
                        this.getView().setBusy(false);
                        MessageBox.error(oError.message);
                    }
                });
            },
            
            onCancelPressed: function () {
                const oModel = this.getView().getModel();

                oModel.resetChanges().then(() => {
                    if (this.bCreate) {
                        this.onNavBack();
                    } else {
                        this._toggleEdit(false);
                    }
                });
            },

            genderFormatter: function(sKey) {
                const sText = this.getLocalizedText(sKey);

                return sText;
                
            },

            dateFormatter: function(date) {
                const dateObj = new Date(date);

                return dateObj.getDate() + "." + (dateObj.getMonth() + 1) + "." + dateObj.getFullYear();
            }
        });
    });