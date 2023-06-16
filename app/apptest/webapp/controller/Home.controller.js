sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,
              JSONModel,
              MessageBox,
              MessageToast) {
        "use strict";

        return Controller.extend("apptest.controller.Home", {
            onInit: async function () {

                let oModel = new JSONModel({});
                const aDataOrders = await this._getHanaData("/ordersTable");
                oModel.setProperty("/ordersTable", aDataOrders)
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
              onPressDelete: function (oEvent) {
                const oModel = this.getView().getModel();
                const oLine = oEvent.getSource().getBindingContext("myModel").getObject();
                const sKey = oLine.Id;
                console.log(sKey);
                const sPath = `/ordersTable(${sKey})`;
        
                MessageBox.warning("Are you sure you want to delete?", {
                  actions: [MessageBox.Action.OK, MessageBox.Action.CLOSE],
                  onClose: async (sAction) => {
                    if (sAction == "OK") {
                      oModel.remove(sPath, {
                        success: async () => {
                          MessageToast.show("Deletion was successful")
                          let oModel = new JSONModel({});
                          const aDataOrders = await this._getHanaData("/ordersTable");
                          oModel.setProperty("/ordersTable", aDataOrders)
                          this.getView().setModel(oModel, "myModel");
                        },
                        error: async (e) => {
                          console.log(e);
                          MessageToast.show("Error in the deleting process")
                        },
                      });
                    }
                  },
                });
              },
              onPressCreateDialog: function () {
                if (!this.pDialog) {
                  this.pDialog = this.loadFragment({
                    name: "apptest.view.fragments.orderCreateForm",
                  });
                }
                this.pDialog.then(function (oDialog) {
                  oDialog.open();
                });
              },
              closeOnPress: function () {
                this.byId("createDialog").close();
              },
              onPressAdd: function(){
                const modelloDati = this.getOwnerComponent().getModel();
                const oNew = this.getView().getModel("orderFormModel").getData();

                console.log(oNew.orderDate);

                modelloDati.create("/ordersTable", {Id          : parseInt(oNew.Id),
                                                    orderDate   : oNew.orderDate,
                                                    shippingDate: oNew.shippingDate,
                                                    product     : oNew.product,
                                                    price       : parseInt(oNew.price),
                                                    client_Id   :parseInt(oNew.client_Id),
                                                    client_email: oNew.client_email}, {
                  success: async (oNew, response) => {
                      MessageToast.show("New entry created")
                      let oModel = new JSONModel({});
                      const aDataOrders = await this._getHanaData("/ordersTable");
                      oModel.setProperty("/ordersTable", aDataOrders)
                      this.getView().setModel(oModel, "myModel");
                  },
                  error: async (e) => {
                    console.log(e);
                    const msg = "Error in the creation. Enter a non-existent ID";
                    MessageToast.show(msg);
                  },
                })
              }
              
        });
    });
