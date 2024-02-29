// Copyright (c) 2023, Jignasha and contributors
// For license information, please see license.txt
/* eslint-disable */

function stripHtmlTags(html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}
frappe.query_reports["Labour Payment"] = {
    "filters": [
        {
            "fieldname": "month",
            "label": __("Month"),
            "fieldtype": "Select",
            "options": "January\nFebruary\nMarch\nApril\nMay\nJune\nJuly\nAugust\nSeptember\nOctober\nNovember\nDecember",
            "default": frappe.datetime.get_today().split("-")[1],
            "reqd": 1
        },
        {
            "fieldname": "year",
            "label": __("Year"),
            "fieldtype": "Data",
            "default": frappe.datetime.get_today().split("-")[0],
            "reqd": 1
        },
        {
            "fieldname": "employee_type",
            "label": __("Employee Type"),
            "fieldtype": "Link",
            "options": "Employee Type",  // Replace with the actual doctype for Employee Type
            "get_query": function () {
                return {
                    "filters": {
                        "company": "Khetan Udyog"
                    }
                };
            },
            "default": "Plant Labours - SU1"
        }
    ],
   
    
    
};    
