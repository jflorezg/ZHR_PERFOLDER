sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/vbm/AnalyticMap",
	"sap/ui/Device",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Text",
	"sap/viz/ui5/api/env/Format",
	'sap/m/MessageToast',
	'sap/ui/model/Filter',
	"sap/viz/ui5/format/ChartFormatter",
	"sap/ui/core/UIComponent"

], function (Controller, JSONModel, Fragment, ODataModel, AnalyticMap, Device, Button, Dialog, Text, Format,
	MessageToast, Filter, ChartFormatter, UIComponent) {
	"use strict";
	// me creo el Modelo Global
	sap.ui.getCore().attachInit(function () {
		var oModelGlobal = new sap.ui.model.json.JSONModel({
			ofertasOriginales: {}
			
		});
		sap.ui.getCore().setModel(oModelGlobal);
	});
	return Controller.extend("com.lh.zhr_paymentstb.controller.BaseController", {

		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		// test apra ver como funciona la herencia de funciones
		test: function (string) {
			string += "-teere-";
			return string;
		}

	});

});