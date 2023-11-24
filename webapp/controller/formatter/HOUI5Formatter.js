sap.ui.define([],
    function () {
        "use strict";
        return {
            genderFormatter: function (sKey) {
                let oView = this.getView();
                let oI18nModel = oView.getModel("i18n");
                let oResourceBundle = oI18nModel.getResourceBundle();
                let sText = oResourceBundle.getText(sKey);
                return sText;
            },

            dateFormatter: function(date) {
                let dateObj = new Date(date);
                return dateObj.getDate() + "." + (dateObj.getMonth() + 1) + "." + dateObj.getFullYear();
            }
        }
    });