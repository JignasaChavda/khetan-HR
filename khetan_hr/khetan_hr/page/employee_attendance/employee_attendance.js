
frappe.pages['employee-attendance'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Daily Attendance Report',
		single_column: true
	});
	
	page.add_button(__('Print'), function() {
		printAttendanceDetails();
	}, 'icon-print'); // 'icon-print' is the icon class for a print icon
  
   
	var content_wrapper = $('<div>').appendTo(page.body);
 
 
	// var content_wrapper = $('<div>').appendTo(page.body);
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
			label: 'Company',
			fieldtype: 'Link',
			fieldname: 'company',
			options: 'Company'
		},
		{
			label: 'Department',
			fieldtype: 'Link',
			fieldname: 'department',
			options: 'Department',
			default:'All Departments'
		   
		},
		{
			label: 'Status',
			fieldtype: 'Select', // Change the fieldtype to Multiselect
			fieldname: 'status',
			options: ['','Present', 'Absent','On Leave','Half Day','Work From Home'], // Allow multiple values to be selected
			default: ''
		},
	   
		{
			label: 'Employee Type',
			fieldtype: 'Link',
			fieldname: 'employee_type',
			options: 'Employee Type',
		   
		   
		}
	   
	   
	];
   
   
	let fromDate, toDate, company, department,status,employee_type;
	function printAttendanceDetails() {
		// Generate a printable version of the content
		var printContent = getPrintableContent();
 
 
		// Open a new window for printing
		var printWindow = window.open('', '_blank');
		printWindow.document.write(printContent);
		printWindow.document.close();
 
 
		// Trigger the print function after the document is fully loaded
		printWindow.onload = function() {
			printWindow.print();
		};
	}
	function getPrintableContent() {
		// Extract content from the existing content_wrapper
		var printableContent = content_wrapper.html();
   
		// Wrap the content in a <div> with a specific class for styling in print
		printableContent = '<div class="printable-content">' + printableContent + '</div>';
   
		// You may need to modify the styles or structure for better print formatting
   
		// Return the printable content
		return printableContent;
	}
	function getLWFDetailedData(from_date, to_date, company, department) {
		// Extract content from the existing content_wrapper
		var printableContent = content_wrapper.html();
   
		// Wrap the content in a <div> with a specific class for styling in print
		printableContent = '<div class="printable-content">' + printableContent + '</div>';
   
		// You may need to modify the styles or structure for better print formatting
   
		// Return the printable content
		return printableContent;
	}
   
	function debounce(func, wait) {
	let timeout;
	return function (...args) {
		clearTimeout(timeout);
		timeout = setTimeout(() => func.apply(this, args), wait);
	};
 }
 
 
 getLWFDetailedData(fromDate, toDate, company, department, employee_type);
 fields.forEach(field => {
	let fieldObj = page.add_field(field);
 
 
	// Set default values
	if (field.fieldname === 'from') {
		let firstDayOfMonth = new Date(frappe.datetime.get_today());
		firstDayOfMonth.setDate(1);
		let formattedDate = frappe.datetime.str_to_user(firstDayOfMonth).split('-').reverse().join('-');
		fieldObj.set_value(formattedDate);
		fromDate = formattedDate;
 
 
		// Add change event listener to 'From Date' field
		fieldObj.$input.on('blur', function () {
			// Calculate the end date of the month based on the selected starting date
			let startDate = fieldObj.get_value();
			let formattedEndDate = frappe.datetime.str_to_user(startDate).split('-').reverse().join('-');
 
 
			// Set the value of the 'To Date' field to the calculated end date
			page.fields_dict['to'].set_value(formattedEndDate);
			toDate = formattedEndDate;
 
 
			// Call getLWFDetailedData after the dates have been updated
			// getLWFDetailedData(fromDate, toDate, company, department, status);
		});
	} else if (field.fieldname === 'to') {
		// Handle the 'To Date' field separately if needed
	} else if (field.fieldname === 'company') {
		let defaultCompany = 'Khetan Udyog'; // Replace with your default company value
		fieldObj.set_value(defaultCompany);
		company = defaultCompany;
	} else if (field.fieldname === 'employee_type') {
		let emp_type = 'Plant Labours - SU1'; // Replace with your default employee type value
		fieldObj.set_value(emp_type);
		employee_type = emp_type;
	}
 
 
	// Add change event listener
	fieldObj.$input.on('change', debounce(function() {
		var changing_date = fieldObj.get_value();
		// console.log('Status Filter Changed:', fieldObj.get_value());
		if (field.fieldname === 'from') {
			fromDate = changing_date;
 
 
			// Automatically set 'To Date' equal to 'From Date'
			page.fields_dict['to'].set_value(changing_date);
			toDate = changing_date;
		} else if (field.fieldname === 'to') {
			toDate = changing_date;
		} else if (field.fieldname === 'company') {
			company = changing_date;
		} else if (field.fieldname === 'department') {
			department = changing_date;
		} else if (field.fieldname === 'status') {
			status = changing_date;
		}
		 if (field.fieldname === 'employee_type') {
			employee_type= changing_date;
		}
 
 
		// Call getLWFDetailedData after the dates or status have been updated
		getLWFDetailedData(fromDate, toDate, company, department, status, employee_type);
	}));
 });
 
 
 
 
 // Add a "Load More" button to trigger the next page
 // hrms.hr.page.daily_attendace_.daily_attendance.get_lwf_details
 
 
 // Attach click event to the "Load More" button
 
 
 
 
 // Call getLWFDetailedData initially with the default page_start
 
 
 getLWFDetailedData(fromDate, toDate, company, department, employee_type);
 
 
 
 
 function getLWFDetailedData(from_date, to_date, company, department, status, employee_type) {
	var args = {
		from_date: from_date,
		to_date: to_date,
		company: company,
		department: department,
		status: status,
		// employee_type: employee_type
	};
 
 
	// Include employee_type in args only if it's specified
	if (employee_type) {
		args.employee_type = employee_type;
	}
 
 
	frappe.call({
		method: 'khetan_hr.khetan_hr.page.employee_attendance.employee_attendance.get_lwf_details',
		args: args,
		callback: function (response) {
			if (response.message) {
				var data = response.message;
				var uniqueDepartments = Array.from(new Set(data.map(item => item.department)));
				displayAttendanceDetails(uniqueDepartments, data, from_date, company, status);
			} else {
				console.error("No data received from the server.");
			}
		}
	});
 }
 
 
 
 
 
 
	function displayAttendanceDetails(departments, data, fromDate, company) {
			// console.log( company, department, status, "guyguyguyguy");
			// Empty the content_wrapper before appending new data
	content_wrapper.empty();
	var htmlContent = '';
   
	// ... append content to htmlContent ...
	content_wrapper.html(htmlContent);
	// Organize data by date
	var organizedData = {};
	data.forEach(item => {
		var date = moment(item.attendance_date, 'YYYY-MM-DD').format('DD-MMM-YYYY');
		if (!organizedData[date]) {
			organizedData[date] = [];
		}
		organizedData[date].push(item);
	});
  
   
	function changeDate(direction) {
		var currentDate = moment(fromDate, 'YYYY-MM-DD');
		currentDate.add(direction, 'days');
		fromDate = currentDate.format('YYYY-MM-DD');
	   
		// Update 'From Date' field value
		page.fields_dict['from'].set_value(fromDate);
		page.fields_dict['employee_type'].refresh();
		// Call getLWFDetailedData with the updated date
		getLWFDetailedData(fromDate, toDate, company, department,employee_type);
	}
   
	// Display formatted fromDate and company name outside the loop
	content_wrapper.append(`<h3 style="font-size:25px;">Company: ${company}</h3>`);
  
	// Iterate over dates
	Object.keys(organizedData).sort().forEach(date => {
		var formattedDate = moment(date, 'DD-MMM-YYYY').format('DD-MMM-YYYY');
		content_wrapper.append(`<h5 style="font-size:20px;">Attendance Date: ${formattedDate}</h5>`);
   
		// Iterate over departments for each date
		for (var i = 0; i < departments.length; i++) {
			var department = departments[i];
			var departmentData = organizedData[date].filter(item => item.department === department);
			// console.log('Department Data:', departmentData); // Log the data
   
			// Pass the department data and formatted date to the template
			var html = frappe.render_template('employee_attendance', { department: department, ename: departmentData, company: company, from_date: formattedDate });
			content_wrapper.append(html);
		}
	});
   
 }
 
 
 }
 
