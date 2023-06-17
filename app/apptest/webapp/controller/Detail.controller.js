sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/UIComponent", 
    "sap/ui/core/routing/History"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,
              JSONModel,UIComponent, History ) {
        "use strict";

        
        return Controller.extend("apptest.controller.Detail", {

            getRouter: function () {
                return UIComponent.getRouterFor(this);
            },

            onInit: async function () {

                var oRouter = this.getOwnerComponent().getRouter();
			    oRouter.getRoute("OrderDetail").attachMatched(this._onRouteMatched, this);

                let oModel = new JSONModel({});
                const aDataOrders = await this._getHanaData("/clientsTable");
                oModel.setProperty("/clientsTable", aDataOrders)
                this.getView().setModel(oModel, "myModel");
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
                this.getView().setBusy(true)
                const oArguments = oEvent.getParameter("arguments")
                const sOrderId = oArguments.Id
                var oOrder = await this._getDbKey(`/ordersTable(${parseInt(sOrderId)})`);
                console.log(oOrder)
                this.getView().setModel(new sap.ui.model.json.JSONModel({
                    oOrder
                }), "orderDetail")
               
                this.getView().setBusy(false)
            },
            _getDbKey: function (EntityKey, urlParameter) {
                var xsoDataModelReport = this.getOwnerComponent().getModel();
                return new Promise(
                    function (resolve, reject) {
                        xsoDataModelReport.read(EntityKey, {
                            urlParameters: urlParameter,
                            success: function (oDataIn, oResponse) {
                                resolve(oDataIn);
                            },
                            error: function (error) {
                                reject(console.log("error calling hana DB"))
                            }
                        });
                    });
            },
            onNavButtonPress: function() {
                const sPreviousHash = History.getInstance().getPreviousHash();

                if (sPreviousHash !== undefined) {
                    window.history.back();
                } else {
                    this.getRouter().navTo("RouteHome", {}, true);
                }
            }
              
        });
    });
