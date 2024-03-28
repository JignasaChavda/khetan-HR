// Copyright (c) 2024, jignasha and contributors
// For license information, please see license.txt

frappe.ui.form.on('Labour Salary Payment', {
    from_date: function(frm) {
        var from_date = frm.doc.from_date;
        
        var to_date = frappe.datetime.month_end(from_date);
        
        console.log(to_date)
        frm.set_value('to_date', to_date);
        frm.refresh_field('to_date');
        
    }
});
