sap.ui.define([], function () {
	"use strict";
	return {


		submittalDateFormatter: function (sSubmittal) {

			if (sSubmittal) {
				var year = sSubmittal.getFullYear();
				var month = sSubmittal.getMonth() + 1;
				var day = sSubmittal.getDate();
				if (month.toString().length == 1)
					month = "0" + month.toString();
				if (day.toString().length == 1)
					day = "0" + day.toString();
				var sName = day.toString().concat("/").concat(month).concat("/").concat(year);

				return sName;
			} else {
				return "";
			}

		},

		dateText: function (sDate) {
			
			return sDate.toLocaleDateString();
		}
	};
});