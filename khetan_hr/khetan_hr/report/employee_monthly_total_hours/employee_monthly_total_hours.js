// Copyright (c) 2024, jignasha and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Employee Monthly Total Hours"] = {
	"filters": [
		{
            "fieldname": "month",
            "label": ("Month"),
            "fieldtype": "Select",
            "options": "January\nFebruary\nMarch\nApril\nMay\nJune\nJuly\nAugust\nSeptember\nOctober\nNovember\nDecember",
            "default": frappe.datetime.get_today().split("-")[1],
            "reqd": 1
        },
        {
            "fieldname": "year",
            "label": ("Year"),
            "fieldtype": "Data",
            "default": frappe.datetime.get_today().split("-")[0],
            "reqd": 1
        },
		{
			"fieldname": "employee",
            "label": ("Employee"),
            "fieldtype": "Link",
			"options": "Employee"
		}
	],
	"onload": function(report) {
		report.page.set_title(__("Employee Monthly Total Hours"));
	}
};
