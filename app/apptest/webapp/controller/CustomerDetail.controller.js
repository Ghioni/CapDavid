sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/UIComponent",
    "sap/ui/core/routing/History",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    Controller,
    JSONModel,
    UIComponent,
    History,
    FilterOperator,
    Filter
  ) {
    "use strict";

    return Controller.extend("apptest.controller.CustomerDetail", {
      getRouter: function () {
        return UIComponent.getRouterFor(this);
      },

      onInit: async function () {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("CustomerDetail")
          .attachMatched(this._onRouteMatched, this);

        let oFilterModel = new sap.ui.modol.json.JSONModel();
        let sData = {};
        oFilterModel.setData(sData);
        this.getView().setModel(oFilterModel, "sFilter");

        let oModel = new JSONModel();
        const aDataOrders = await this._getHanaData("/odersTable");
        oModel.setProperty("/odersTable", aDataOrders);
        this.getView().setModel(
          new JSONModel({
            results: oModel,
          }),
          "oModel"
        );
      },

      _getHanaData: function (Entity) {
        const xsoDataModelReport = this.getOwnerComponent().getModel();
        return new Promise(function (resolve, reject) {
          xsoDataModelReport.read(Entity, {
            success: function (oDataIn) {
              resolve(oDataIn.results);
            },
            error: function (error) {
              reject(console.log(error));
            },
          });
        });
      },

      _onRouteMatched: async function (oEvent) {
        this.getView().setBusy(true);
        const oArguments = oEvent.getParameter("arguments");
        const sCustomerId = oArguments.Id;
        var oCustomer = await this._getDbKey(
          `/clientsTable(${parseInt(sCustomerId)})`
        );

        this.getView().setModel(
          new sap.ui.model.json.JSONModel({
            oCustomer,
          }),
          "customerDetail"
        );

        this.getView().setBusy(false);
      },
      _getDbKey: function (EntityKey, urlParameter) {
        var xsoDataModelReport = this.getOwnerComponent().getModel();
        return new Promise(function (resolve, reject) {
          xsoDataModelReport.read(EntityKey, {
            urlParameters: urlParameter,
            success: function (oDataIn, oResponse) {
              resolve(oDataIn);
            },
            error: function (error) {
              reject(console.log("error calling hana DB"));
            },
          });
        });
      },
      onNavButtonPress: function () {
        const sPreviousHash = History.getInstance().getPreviousHash();

        if (sPreviousHash !== undefined) {
          window.history.back();
        } else {
          this.getRouter().navTo("RouteHome", {}, true);
        }
      },
      onPressAdd: async function(){
        this.getView().byId("idProductsTable").setVisible(true);
        
      }
      
    });
  }
);
