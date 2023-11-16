sap.ui.define([
    "at/clouddna/training00/zhoui5/controller/BaseController",
    "sap/m/MessageBox",
    "at/clouddna/training00/zhoui5/controller/formatter/HOUI5Formatter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, MessageBox, HOUI5Formatter) {
        "use strict";

        return BaseController.extend("at.clouddna.training00.zhoui5.controller.Main", {
            ...HOUI5Formatter,

            onInit: function () {
                this.setContentDensity();
            },
            
            onDeletePressed: function(oEvent){
                const oListItem = oEvent.getParameters().listItem;
                const oModel = this.getView().getModel();
                const sPath = oListItem.getBindingContext().getPath();
            
                MessageBox.warning(this.getLocalizedText("sureToDeleteQuestion"), {
                    title: this.getLocalizedText("sureToDeleteTitle"),
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: (oAction)=>{
                        if(MessageBox.Action.YES === oAction){
                            this.getView().setBusy(true);

                            oModel.remove(sPath, {
                                success: (oData, response) => {
                                    this.getView().setBusy(false);

                                    MessageBox.success(this.getLocalizedText("dialog.delete.success"));
                                    oModel.refresh(true);
                                },
                                error: (oError) => {
                                    this.getView().setBusy(false);

                                    MessageBox.error(oError.message);
                                }
                            });
                        }
                    }
                });
            },

            onListItemClicked: function(oEvent) {
                const sPath = oEvent.getSource().getBindingContext().getPath();

                this.getRouter().navTo("RouteCustomer", {
                    path: encodeURIComponent(sPath)
                }, false);
            },

            onCreatePressed: function() {
                this.getRouter().navTo("CreateCustomer", null, false);
            },
        });
    });