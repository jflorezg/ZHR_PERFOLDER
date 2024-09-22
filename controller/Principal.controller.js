sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ushell/services/UserInfo",
	"sap/m/MessageBox",
	'./BaseController',
	"sap/m/PDFViewer",
	"sap/m/MessageToast",
], function(Controller, JSONModel, UserInfo, MessageBox, BaseController, PDFViewer, MessageToast) {
	"use strict";

	return BaseController.extend("com.lh.zhr_paymentstb.controller.Principal", {
		onInit: function() {

		},
		onBeforeRendering: function() {
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
				async:false,
				success: function (oData) {
					console.log(oData);
					this.userData = oData;
					var oMdl = new sap.ui.model.json.JSONModel(oData);
					this.setModel(oMdl, "employeeData");
					this.getOwnerComponent().getModel("employeeData").attachRequestCompleted(function(){
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
				this.setPayDateList(oData.Pernr);
				//	oModelF4.read("/EmployeeDataSet('"+uinfo.getId()+"')", { MARIJIMENEZ
				this._pdfViewer = new PDFViewer({
					isTrustedSource: true,
					error: function(oEvt){
						this.showErrorPDF(oEvt);
					}.bind(this)
				});
				this.getView().addDependent(this._pdfViewer);
				this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					
					
					//	var filterByID = new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, "00036230");// ABS 36230
					//	var filterByID = new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, "00027473");//EC
					//	var filterByID = new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, "00009407");
					//var filterByID = new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, "00023490");	//	23490
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
		showErrorPDF: function(oEvent){
			console.log(oEvent);
			MessageToast.show("En estos momentos no es posible generar el documento solicitado, por favor contactar a Recursos Humanos");
		},
		confirmSign: function(oEvent) {
			var oEvent_ant = oEvent;
			this.sequenceSign = oEvent.getSource().getParent().getParent().getCells()[2].getProperty("text");
			MessageBox.information("Desea firmar su comprobante de pago?", {
				actions: ["Firmar", "Cancelar"],
				emphasizedAction: MessageBox.Action.OK,
				onClose: function(sAction) {
					if (sAction === "Firmar") {
						//console.log(oEvent)
						this.sendSign(this.sequenceSign);
					}
				}.bind(this)
			});
		},
		sendSign: function(sSequence) {
			console.log("user " + this.userData.Pernr);
			console.log("sequence " + sSequence)
			var oModel = this.getView().getModel("paymentModel");
			var sFunctionName = "/SingPayment";
			var mParameters = {};
			mParameters.urlParameters = {
				Seqnr: sSequence,
				Pernr: this.userData.Pernr
			};
			console.log(mParameters);
			mParameters.method = "POST";
			mParameters.success = function(oData) {
				console.log(oData);

				sap.m.MessageToast.show("¡Comprobante firmado con exito!", {
					duration: 3000, // default
					//width: "15em", // default
					my: "center bottom", // default
					at: "center bottom", // default
					of: window, // default
					offset: "0 0", // default
					collision: "fit fit", // default
					onClose: this.onInit(), // default
					autoClose: true, // default
					animationTimingFunction: "ease", // default
					animationDuration: 1000, // default
					closeOnBrowserNavigation: true // default
				});
				this.onSignFinished();
			}.bind(this);
			mParameters.error = function(oEven) {
				console.log(oEven);
			}.bind(this);
			oModel.callFunction(sFunctionName, mParameters);
		},
		setPayDateList: function(sPenr) {
			var filters = [];
			var filterByID = new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, sPenr);
			filters.push(filterByID);
			var payModel = this.getOwnerComponent().getModel("paymentModel");
			payModel.read("/Paystub_listSet", {
				filters: filters,
				async: true,
				success: function(oData2, oresponse) {
					this.getView().setBusy(false);
					console.log(oData2);
					var oMdl = new sap.ui.model.json.JSONModel(oData2);
					this.getView().setModel(oMdl, "payData");
				}.bind(this),
				error: function(oError) {
					console.log(oError);
					payModel.read("/Paystub_listSet", {
						filters: filters,
						async: true,
						success: function(oData2, oresponse) {
							this.getView().setBusy(false);
							var oMdl = new sap.ui.model.json.JSONModel(oData2);
							this.getView().setModel(oMdl, "payData");
							this.getView().getModel().refresh();
							console.log(this.getView().getModel());
						}.bind(this),
						error: function(oError) {
							console.log(oError);

						}.bind(this)

					});
				}.bind(this)

			});
		},
		onPayDateSelect: function(oEvent) {
			console.log(oEvent.getSource().getSelectedItem());
			var aPayDate = oEvent.getSource().getSelectedItem().getProperty("key").split(".");
			var sPayDate = `${aPayDate[1]}${aPayDate[0]}`
			console.log(sPayDate);
			var filters = [];
			var filterPernr = new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, this.userData.Pernr);
			filters.push(filterPernr);
			var filtersPayDate = new sap.ui.model.Filter("Fpper", sap.ui.model.FilterOperator.EQ, sPayDate);
			filters.push(filtersPayDate);
			var payModel = this.getOwnerComponent().getModel("paymentModel");
			payModel.read("/Paystub_seqnrSet", {
				filters: filters,
				async: true,
				success: function(oData2, oresponse) {

					console.log(oData2);
					var oMdl = new sap.ui.model.json.JSONModel(oData2);
					this.getView().setModel(oMdl, "paymentInfo");
					this.getView().getModel("paymentInfo").refresh();
				}.bind(this),
				error: function(oError) {
					console.log(oError);

				}.bind(this)

			});
		},
		onSignFinished: function() {

			var aPayDate = this.byId("selTime").getSelectedItem().getProperty("key").split(".");
			var sPayDate = `${aPayDate[1]}${aPayDate[0]}`
			console.log(sPayDate);
			var filters = [];
			var filterPernr = new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, this.userData.Pernr);
			filters.push(filterPernr);
			var filtersPayDate = new sap.ui.model.Filter("Fpper", sap.ui.model.FilterOperator.EQ, sPayDate);
			filters.push(filtersPayDate);
			var payModel = this.getOwnerComponent().getModel("paymentModel");
			payModel.read("/Paystub_seqnrSet", {
				filters: filters,
				async: true,
				success: function(oData2, oresponse) {

					console.log(oData2);
					var oMdl = new sap.ui.model.json.JSONModel(oData2);
					this.getView().setModel(oMdl, "paymentInfo");
					this.getView().getModel("paymentInfo").refresh();
				}.bind(this),
				error: function(oError) {
					console.log(oError);

				}.bind(this)

			});
		},
		onOpenPDF: function(oEvent) {
			console.log(oEvent.getSource());
			let sPeriod = oEvent.getSource().getParent().getParent().getCells()[0].getProperty("text");
			let sSeq = oEvent.getSource().getParent().getParent().getCells()[2].getProperty("text");
			let cfdiVal = this.getView().byId("idGroupTypePT").getSelectedIndex() === 0 ? false : true;
			var sServiceURL = this.getView().getModel("paymentModel").sServiceUrl;
			var sSource = sServiceURL + `/Paystub_fileSet(Pernr='${this.userData.Pernr}',Seqnr='${sSeq}',Cfdi=${cfdiVal})/$value`; //,Fpper='${sPeriod}'
			this._pdfViewer.setSource(sSource);
			this._pdfViewer.setTitle("My PDF");
			this._pdfViewer.open();
		},
		showErrorRequest: function(str) {
			sap.m.MessageBox.error(str.error.message.value);
		},
		setVisibilidad: function(boolVis) {
			this.byId("textPayed").setVisible(false);
			this.byId("payedDays").setVisible(false);
		},
		onPress: function(oEvent) {
			var sSource = oEvent.getSource().getModel().getData().Source;
			this._pdfViewer.setSource(sSource);
			this._pdfViewer.setTitle("My Custom Title");
			this._pdfViewer.open();
		},
		showError: function(str) {
			sap.m.MessageBox.error(str.error.message.value);
		},

		handleRouteMatched: function(oEvent) {
			console.log("entro handle");
		},

		_setF4: function(oApp, oData, sJSONModel) {
			var oJSONModel = new JSONModel();
			//	oJSONModel.setSizeLimit(oData.results.length);
			oJSONModel.setData(oData);
			oApp.setModel(oJSONModel, sJSONModel);
			console.log(oApp.getModel("employeeData"));
		},
		getFecha: function(str) {
			/*var fec =	new Date(str).toLocaleString();
			var afec = fec.split(" ");*/
			var asp = str.split("/");
			var trs = asp[2] + this.fillCeros(asp[1]) + this.fillCeros(asp[0]);
			return trs;
		},
		fillCeros: function(str) {
			if (str.length === 1) {
				return "0" + str;
			} else {
				return str;
			}
		},

		confirmsendRequest: function(oEvent) {
			sap.m.MessageBox.confirm(this.geti18nText("form_vac_msg1"), { //Desea enviar la solicitud de vacaciones actual
				title: this.geti18nText("form_vac_msg2"), // "Solicitud Vacaciones", // default
				onClose: function(sButton) {
					if (sButton === sap.m.MessageBox.Action.OK) {
						this.sendRequest(oEvent, "X");
					}
				}.bind(this), // default
				styleClass: "", // default
				actions: [sap.m.MessageBox.Action.OK,
					sap.m.MessageBox.Action.CANCEL
				], // default
				emphasizedAction: sap.m.MessageBox.Action.OK, // default
				initialFocus: null, // default
				textDirection: sap.ui.core.TextDirection.Inherit // default
			});
		},

		geti18nText: function(text) {
			return this.getView().getModel("i18n").getResourceBundle().getText(text);
		},

		doNavigate: function(sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
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
					oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function(bindingContext) {
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
