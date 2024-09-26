sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ushell/services/UserInfo",
	"sap/m/MessageBox",
	'./BaseController',
	"sap/m/PDFViewer",
	"sap/m/MessageToast",
], function (Controller, JSONModel, UserInfo, MessageBox, BaseController, PDFViewer, MessageToast) {
	"use strict";

	return BaseController.extend("com.lh.zhr_perfolder.controller.Principal", {
		onInit: function () {

		},
		onBeforeRendering: function () {
			var oData = {
				view_vis: {

				},
				view_form: {

				}
			};
			this.country = "";
			var oModel = new JSONModel(oData);
			this.getView().setModel(oModel, "vis_principal");

			this.getView().setBusy(true);
			//this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oModelF4 = this.getOwnerComponent().getModel();

			this.jModel = new sap.ui.model.json.JSONModel();
			this.selectedMod = {};
			this._data = {};
			var uinfo = new sap.ushell.services.UserInfo();
			var oTable = this.byId("tvac");
			oModelF4.read("/EmployeeDataSet('')", {
				async: false,
				success: function (oData) {
					console.log(oData);
					this.userData = oData;
					var oMdl = new sap.ui.model.json.JSONModel(oData);
					this.setModel(oMdl, "employeeData");
					this.getOwnerComponent().getModel("employeeData").attachRequestCompleted(function () {
						console.log("data cargada");
					});

					if (oData.Country !== "MX") {
						var oVisible = {
							"visible": false
						}
						var oMvis = new sap.ui.model.json.JSONModel(oVisible);
						this.getView().setModel(oMvis, "visibilidadModel");
						this.getView().getModel("visibilidadModel").refresh();
					}
					this.getDocumentsUser(this.userData.Pernr);
					//	oModelF4.read("/EmployeeDataSet('"+uinfo.getId()+"')", { MARIJIMENEZ
					this._pdfViewer = new PDFViewer({
						//displayType: "Embedded",
						isTrustedSource: true,
						error: function (oEvt) {
							this.showErrorPDF(oEvt);
						}.bind(this)
					});

					this.getView().setBusy(false);
					this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				}.bind(this),
				error: function (oError) {
					console.log(oError);
					this.showError(JSON.parse(oError.responseText));
					this.getView().setBusy(false);
				}.bind(this)

			});
			this.getView().setModel(this.jModel, "leaveTypes");
			console.log(oModelF4);
			//var that = this.getView(); //.getParent();
		},
		showErrorPDF: function (oEvent) {
			console.log(oEvent);
			MessageToast.show("En estos momentos no es posible generar el documento solicitado, por favor contactar a Recursos Humanos");
		},
		confirmSign: function (oEvent) {
			var oEvent_ant = oEvent;
			this.sequenceSign = oEvent.getSource().getParent().getParent().getCells()[2].getProperty("text");
			MessageBox.information("Desea firmar su comprobante de pago?", {
				actions: ["Firmar", "Cancelar"],
				emphasizedAction: MessageBox.Action.OK,
				onClose: function (sAction) {
					if (sAction === "Firmar") {
						//console.log(oEvent)
						this.sendSign(this.sequenceSign);
					}
				}.bind(this)
			});
		},
		getDocumentsUser: function (sEmployee) {
			var oModelF4 = this.getModel("paymentModel");
			var filters = [];
			var filterByID = new sap.ui.model.Filter("pernr", sap.ui.model.FilterOperator.EQ, sEmployee);
			filters.push(filterByID);
			oModelF4.read("/GetListDocSet", {
				async: false,
				filters: filters,
				success: function (oData) {
					console.log(oData);
					var root = this.buildNodes(oData.results);
					console.log(root);
					let rootResults = {
						results: root
					}
					var oModel = new JSONModel(rootResults);
					this.setModel(oModel, "rootModel");
				}.bind(this),
				error: function (oError) {
					console.log(oError);
					oModelF4.read("/GetListDocSet", {
						async: false,
						filters: filters,
						success: function (oData) {
							console.log(oData);
							var root = this.buildNodes(oData.results);
							console.log(root);
							let rootResults = {
								results: root
							}
							var oModel = new JSONModel(rootResults);
							this.setModel(oModel, "rootModel");

						}.bind(this),
						error: function (oError) {
							console.log(oError);

						}.bind(this)

					});

				}.bind(this)

			});
		},
		buildNodes: function (aDocuments) {
			var root = [];
			var leaf = [];
			for (var i = 0; i < aDocuments.length; i++) {
				if (aDocuments[i].father === "") {
					aDocuments[i].nodes = [];
					root.push(aDocuments[i]);
				}
				if (parseInt(aDocuments[i].level) === 2) {
					var index = root.findIndex(m => m.index === aDocuments[i].father)
					if (aDocuments[i].hasOwnProperty("nodes")) {
						root[index].nodes.push(aDocuments[i]);
					} else {
						aDocuments[i].nodes = [];
						root[index].nodes.push(aDocuments[i]);
					}

				}
				if (parseInt(aDocuments[i].level) === 3) {
					var index;
					for (var j = 0; j < root.length; j++) {
						index = root[j].nodes.findIndex(m => m.index === aDocuments[i].father)
						if (index !== -1) {
							if (aDocuments[i].hasOwnProperty("nodes")) {
								if (aDocuments[i].docid !== "") {
									aDocuments[i].event = "X";
									root[j].nodes[index].nodes.push(aDocuments[i]);
								} else {
									aDocuments[i].event = "";
									root[j].nodes[index].nodes.push(aDocuments[i]);
								}
							} else {
								if (aDocuments[i].docid !== "") {
									aDocuments[i].event = "X";
									root[j].nodes[index].nodes.push(aDocuments[i]);
								} else {
									aDocuments[i].event = "";
									root[j].nodes[index].nodes.push(aDocuments[i]);
								}
							}
						}
					}

				}
			}
			return root;
		},

		onOpenPDF: function (oEvent) {
			console.log(oEvent.getSource());
			let sClDoc = oEvent.getSource().getCustomData()[1].getProperty("value");
			let sDocId = oEvent.getSource().getCustomData()[0].getProperty("value").replaceAll(" ", "");
			if (sClDoc === null) return false;

			var sServiceURL = this.getView().getModel("paymentModel").sServiceUrl;
			//ZGW_HMND_EXPED_SRV/GetDocSet(cldoc='ZHRXX0SCBA',docid='12C7EDE377F11EEF94E6955F5AD132E2')/$value
			var sSource = sServiceURL + `/GetDocSet(cldoc='${sClDoc}',docid='${sDocId}')/$value`; //,Fpper='${sPeriod}'
			this._pdfViewer.setSource(sSource);
			this._pdfViewer.setTitle("My PDF");
			this.getView().byId("detail").addContent(this._pdfViewer);
			//this._pdfViewer.open();
		},
		showErrorRequest: function (str) {
			sap.m.MessageBox.error(str.error.message.value);
		},

		onPress: function (oEvent) {
			var sSource = oEvent.getSource().getModel().getData().Source;
			this._pdfViewer.setSource(sSource);
			this._pdfViewer.setTitle("My Custom Title");
			this._pdfViewer.open();
		},
		showError: function (str) {
			sap.m.MessageBox.error(str.error.message.value);
		},

		handleRouteMatched: function (oEvent) {
			console.log("entro handle");
		},

		_setF4: function (oApp, oData, sJSONModel) {
			var oJSONModel = new JSONModel();
			//	oJSONModel.setSizeLimit(oData.results.length);
			oJSONModel.setData(oData);
			oApp.setModel(oJSONModel, sJSONModel);
			console.log(oApp.getModel("employeeData"));
		},

		geti18nText: function (text) {
			return this.getView().getModel("i18n").getResourceBundle().getText(text);
		},

		doNavigate: function (sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oModel = (oBindingContext) ? oBindingContext.getModel() : null;

			var sEntityNameSet;
			if (sPath !== null && sPath !== "") {
				if (sPath.substring(0, 1) === "/") {
					sPath = sPath.substring(1);
				}
				sEntityNameSet = sPath.split("(")[0];
			}
			var sNavigationPropertyName;
			var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;

			if (sEntityNameSet !== null) {
				sNavigationPropertyName = sViaRelation;
			}
			if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
				if (sNavigationPropertyName === "") {
					this.oRouter.navTo(sRouteName);
				} else {
					oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function (bindingContext) {
						if (bindingContext) {
							sPath = bindingContext.getPath();
							if (sPath.substring(0, 1) === "/") {
								sPath = sPath.substring(1);
							}
						} else {
							sPath = "undefined";
						}

						// If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
						if (sPath === "undefined") {
							this.oRouter.navTo(sRouteName);
						} else {
							this.oRouter.navTo(sRouteName, {
								context: sPath,
								masterContext: sMasterContext
							}, false);
						}
					}.bind(this));
				}
			} else {
				this.oRouter.navTo(sRouteName);
			}

			if (typeof fnPromiseResolve === "function") {
				fnPromiseResolve();
			}

		}
	});
});