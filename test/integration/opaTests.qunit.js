/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/lh/leaverequest/Z_LeaveRequest/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});