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
                          // Refresh of the table
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
                // Adjust timezone of date picker
                const orderDate = oNew.orderDate;
                const shippingDate = oNew.shippingDate;
                orderDate.setHours(3);
                shippingDate.setHours(3);

                modelloDati.create("/ordersTable", {Id          : parseInt(oNew.Id),
                                                    orderDate   : orderDate,
                                                    shippingDate: shippingDate,
                                                    product     : oNew.product,
                                                    price       : parseInt(oNew.price),
                                                    client_Id   :parseInt(oNew.client_Id),
                                                    client_email: oNew.client_email}, {
                  success: async (oNew, response) => {
                      MessageToast.show("New entry created")
                      // Refresh of the table
                      let oModel = new JSONModel({});
                      const aDataOrders = await this._getHanaData("/ordersTable");
                      oModel.setProperty("/ordersTable", aDataOrders)
                      this.getView().setModel(oModel, "myModel");
                      // Closing of the dialog
                      this.byId("createDialog").close();
                  },
                  error: async (e) => {
                    console.log(e);
                    const msg = "Error in the creation. Enter a non-existent ID";
                    MessageToast.show(msg);
                  },
                })
              },
              onPressGetObject: function(oEvent){
                const oLine = oEvent.getSource().getBindingContext("myModel").getObject();
                this.getView().setModel(new JSONModel(oLine), "editForm");
                
                this.onPressEditDialog(oLine);
              },
              onPressEditDialog: function(){
                if (!this.pDialog2) {
                  this.pDialog2 = this.loadFragment({
                    name: "apptest.view.fragments.orderUpdateForm",
                  });
                }
                this.pDialog2.then(function (oDialog2) {
                  oDialog2.open();
                });

              },
              closeOnPressEdit: function () {
                this.byId("editDialog").close();
              },
              onPressLine: function (oEvent) {
                const self = this;
                const oLine = oEvent.getSource().getBindingContext("myModel").getObject();
                const oId = oLine.Id;
                
                MessageBox.warning("Do you want to navigate to order detail?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CLOSE],
                    onClose: function (sAction) {
                        if(sAction == 'OK'){
                            self.getOwnerComponent().getRouter().navTo("OrderDetail",{
                                Id: oId
                            })
                        }
                        debugger;
                    }
                });
                
            }
              
        });
    });
