frappe.pages['employee_status_repo'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Employee Status Report',
		single_column: true
	});

	var employee = ''
	var from_date = ''
	var to_date = ''
	var employee_type = ''
	var status = ''

	let e_field = page.add_field({
        label: 'Employee',
        fieldtype: 'Link',
        fieldname: 'employee',
        options: 'Employee',
        change() {
            employee = e_field.get_value();
            check_filters();
        }
    });

	let f_date = page.add_field({
        label: 'From Date',
        fieldtype: 'Date',
        fieldname: 'from_date',
        change() {
            from_date = f_date.get_value()
            check_filters()
        }
    });

	let t_date = page.add_field({
        label: 'To Date',
        fieldtype: 'Date',
        fieldname: 'to_date',
        change() {
            to_date = t_date.get_value()
            check_filters()
        }
    });
    
	let e_type = page.add_field({
        label: 'Employee Type',
        fieldtype: 'Link',
        fieldname: 'to_date',
		options : 'Employee Type',
        change() {
            employee_type = e_type.get_value()
            check_filters()
        }
    });

	let status_field = page.add_field({
        label: 'Status',
        fieldtype: 'Select',
        fieldname: 'status',
        options: '\nActive\nInactive\nSuspended\nLeft',
        change() {
            status = status_field.get_value();
            check_filters();
        }
    });

    page.set_primary_action('Download', function() {
               downloadEmployeeData();
    }, 'octicon octicon-cloud-download');

    function downloadEmployeeData() {
        frappe.call({
          method: 'khetan_hr.khetan_hr.page.employee_status_repo.employee_status_repo.employee_data',
          args: {
            employee: employee,
            from_date: from_date,
            to_date: to_date,
            employee_type: employee_type,
            status: status
          },
          callback: function(response) {
            var empdata = response.message;
			console.log(empdata)
            generateExcelFile(empdata);
          }
        });
      }
      function generateExcelFile(data) {
        const wb = XLSX.utils.book_new();
        const customHeaders = ['ID', 'Full Name', 'Office or Plant','Employee Type', 'Department', 'Plant', 'Status', 'Relieving Date'];
        const ws = XLSX.utils.aoa_to_sheet([customHeaders, ...data.map(item => {
          const { photo_url, date_of_joining, ...rest } = item;
          return [rest.ID, rest.full_name, rest.office_or_plant, rest.employee_type, rest.department, rest.plant, rest.status, rest.relieving_date];
        })]);
        XLSX.utils.book_append_sheet(wb, ws, 'EmployeeData');
        XLSX.writeFile(wb, 'employee_data.xlsx');
      }
  
	function check_filters(){
        if(employee !== null && from_date !== null && to_date !== null && employee_type !==null && status !==null ){
            get_data(employee, from_date, to_date, employee_type, status);
        } else {
            get_data(null, null, null ,null , null); 
        }
    }

	get_data(null, null, null, null, null);
    
	function get_data(employee, from_date, to_date, employee_type, status){
        frappe.call({
            method: 'khetan_hr.khetan_hr.page.employee_status_repo.employee_status_repo.employee_data',
            args: {
                employee: employee,
                from_date: from_date,
                to_date: to_date,
				employee_type : employee_type,
				status : status
            },
            callback: function(response) {
                var empdata = response.message
                $("#1").remove();
                $(frappe.render_template("employee_status_repo", {empdata: empdata})).appendTo(page.body);
                console.log(response.message)

                
            }
        })
    }  
}