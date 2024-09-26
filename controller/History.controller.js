sap.ui.define([
	'./BaseController',
	"sap/ui/core/routing/History",
	"com/lh/leaverequest/Z_LeaveRequest/model/formatter"
], function(BaseController, History, formatter ) {
	"use strict";

	return BaseController.extend("com.lh.zhr_perfolder.controller.History", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.lh.zhr_perfolder.view.view.History
		 */
		onInit: function() {
			var oModel = this.getOwnerComponent().getModel("vacationApprobed");
			var oDatos = oModel.getData();
			var oNjmodel = new sap.ui.model.json.JSONModel();
			oNjmodel.setData(oDatos);
			oNjmodel.refresh();
			var oItem = this.byId("vacationsList");
			this.getView().setModel(oNjmodel, "vacModel");
			console.log(this.getView().getModel("vacModel"));
			var oTemplate = new sap.m.ObjectListItem({

				title: this.geti18nText("form_history2")+' {path:"Begfe", type: "sap.ui.model.type.Date", formatOptions: \{ style: "short", pattern: "yyyy/MM/dd " , UTC: true}   } '+this.geti18nText("form_history3")+' {path:"Endfe", type: "sap.ui.model.type.Date", formatOptions: \{ style: "short", pattern: "yyyy/MM/dd " , UTC: true}  }',
				
				number: "{QtferChar}",

				numberUnit: this.geti18nText("form_history1") , //'Días', //
				firstStatus: new sap.m.ObjectStatus({text: "{TextStatus}", state:"{= ${Zstat} === 'A' ? 'Success' : 'Error' }"
				})
				
			});
			oItem.bindItems("/results", oTemplate);
			oItem.setModel(oModel);
		},
		dateText: function (sDate) {return sDate.toLocaleDateString();},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.lh.zhr_perfolder.view.view.History
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.lh.zhr_perfolder.view.view.History
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.lh.zhr_perfolder.view.view.History
		 */
		//	onExit: function() {
		//
		//	}
		geti18nText:function( text ){
			return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(text);	
		},
		onNavBack: function() {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.back();
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("", true);

			}
		}
	});

});