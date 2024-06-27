frappe.pages['employee_late_entry'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Employee Report',
        single_column: true
    });

    page.add_button(__('Print'), function() {
        printAttendanceDetails();
    }, 'icon-print');

    var content_wrapper = $('<div>').appendTo(page.body);

    let fields = [
        {
            label: 'From Date',
            fieldtype: 'Date',
            fieldname: 'from'
        },
        {
            label: 'To Date',
            fieldtype: 'Date',
            fieldname: 'to'
        },
        {
            label: 'Employee',
            fieldtype: 'Link',
            fieldname: 'employee',
            options: 'Employee',
        },
        {
            label: 'Company',
            fieldtype: 'Link',
            fieldname: 'company',
            options: 'Company'
        },
    ];

    function getLastDateOfMonth(date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    }

    let fromDate, toDate, company, department, status, employee;

    function printAttendanceDetails() {
        var printContent = getPrintableContent();

        var printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();

        printWindow.onload = function() {
            printWindow.print();
        };
    }

    function getPrintableContent() {
        var printableContent = content_wrapper.html();
        printableContent = '<div class="printable-content">' + printableContent + '</div>';
        return printableContent;
    }

    function getLWFDetailedData(from_date, to_date, employee, company) {
        var args = {
            from_date: from_date,
            to_date: to_date,
            employee: employee,
            company: company
        };

        frappe.call({
            method: 'khetan_hr.khetan_hr.page.employee_late_entry.employee_late_entry.get_lwf_details',
            args: args,
            callback: function (response) {
                if (response.message) {
                    var data = response.message;
                    console.log(data);
                    var uniqueDepartments = Array.from(new Set(data.map(item => item.department)));
                    displayAttendanceDetails(uniqueDepartments, data, from_date, company, status);
                } else {
                    console.error("No data received from the server.");
                }
            }
        });
    }

    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Get the stored employee value
    let storedEmployee = localStorage.getItem('selected_employee');

    fields.forEach(field => {
        let fieldObj = page.add_field(field);

        if (field.fieldname === 'from') {
            let firstDayOfMonth = new Date(frappe.datetime.get_today());
            firstDayOfMonth.setDate(1);
            let formattedDate = frappe.datetime.str_to_user(firstDayOfMonth).split('-').reverse().join('-');
            fieldObj.set_value(formattedDate);
            fromDate = formattedDate;

            fieldObj.$input.on('blur', function () {
                fromDate = fieldObj.get_value();
                let from_date_obj = frappe.datetime.str_to_obj(fromDate);
                let last_date_of_month = getLastDateOfMonth(from_date_obj);
                let formattedLastDate = frappe.datetime.str_to_user(last_date_of_month).split('-').reverse().join('-');

                page.fields_dict['to'].set_value(formattedLastDate);
                toDate = formattedLastDate;

                getLWFDetailedData(fromDate, toDate, employee, company);
            });
        } else if (field.fieldname === 'to') {
            fieldObj.$input.on('blur', function () {
                toDate = fieldObj.get_value();
                getLWFDetailedData(fromDate, toDate, employee, company);
            });
        } else if (field.fieldname === 'employee') {
            if (storedEmployee) {
                fieldObj.set_value(storedEmployee);
                employee = storedEmployee;
                getLWFDetailedData(fromDate, toDate, employee, company);
            }
            
            fieldObj.$input.on('change', debounce(function() {
                employee = fieldObj.get_value();
                localStorage.setItem('selected_employee', employee);
                
            }));
        }
        else if (field.fieldname === 'company') {
            let defaultCompany = 'Khetan Udyog'; // Replace with your default company value
            fieldObj.set_value(defaultCompany);
            company = defaultCompany;
            getLWFDetailedData(fromDate, toDate, employee, company);
        }
        


        fieldObj.$input.on('change', debounce(function() {
            var changing_date = fieldObj.get_value();
            if (field.fieldname === 'from') {
                fromDate = changing_date;
            } else if (field.fieldname === 'to') {
                toDate = changing_date;
            } else if (field.fieldname === 'company') {
                company = changing_date;
            } else if (field.fieldname === 'department') {
                department = changing_date;
            } else if (field.fieldname === 'status') {
                status = changing_date;
            } else if (field.fieldname === 'employee_type') {
                employee_type = changing_date;
            }
            if (field.fieldname === 'employee') {
                employee = changing_date;
            }

            getLWFDetailedData(fromDate, toDate, employee, company);
        }));
    });

    function displayAttendanceDetails(departments, data, fromDate, company) {
        content_wrapper.empty();
        var htmlContent = '';
        content_wrapper.append(`<h3 style="font-size:25px;">Company: ${company}</h3>`);

        content_wrapper.html(htmlContent);

        var html = frappe.render_template('employee_late_entry', { ename: data,company: company });
        content_wrapper.append(html);

        // Add event listener to checkboxes
        $(wrapper).off('change', '.check-column').on('change', '.check-column', function() {
            var employee_id = $(this).data('id');
            var department = $(this).data('department');
            var isChecked = $(this).is(':checked');
            var name = $(this).data('name');

            var fromDate = page.fields_dict['from'].get_value();
            var toDate = page.fields_dict['to'].get_value();

            frappe.call({
                method: 'khetan_hr.khetan_hr.page.employee_late_entry.employee_late_entry.update_employee_status',
                args: {
                    employee_id: employee_id,
                    is_checked: isChecked,
                    name: name,
                    from_date: fromDate,
                    to_date: toDate
                },
                callback: function(response) {
                    if (response.message) {
                        console.log(response.message);
                        frappe.msgprint(response.message);
                    } else {
                        // frappe.msgprint("Failed to update employee status.");
                    }
                }
            });
        });
    }
   

    getLWFDetailedData(fromDate, toDate, employee, company);
}