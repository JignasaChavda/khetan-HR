import frappe
from datetime import datetime

@frappe.whitelist()
def get_lwf_details(from_date=None, to_date=None, employee=None, company=None):
    query = """
    SELECT
        DISTINCT tabAttendance.working_hours,
        tabAttendance.employee,
        tabEmployee.employee_name,
        tabAttendance.shift,
        tabAttendance.check_in_time,
        tabAttendance.check_out_time,
        tabAttendance.overtime,
        tabAttendance.status,
        tabAttendance.attendance_date,
        tabAttendance.new_hours,
        tabAttendance.custom_total_hours,
        tabAttendance.custom_late_entry,
        tabAttendance.custom_late_hour_deduction,
        tabAttendance.custom_remarks,
        tabAttendance.custom_allow_late_entry_relaxation,
        tabAttendance.name,
        st.name AS shift_type,
        st.start_time,
        st.end_time,
        tabEmployee.company,
        tabEmployee.department
    FROM
        tabAttendance
    JOIN
        tabEmployee ON tabAttendance.employee = tabEmployee.employee
    JOIN
        `tabShift Type` st ON tabAttendance.shift = st.name
    WHERE
        tabAttendance.attendance_date BETWEEN %s AND %s
        AND tabAttendance.employee = %s
        AND (%s IS NULL OR tabEmployee.company = %s)
        AND tabAttendance.custom_late_hour_deduction != 0  -- Add this line for filtering non-zero custom_late_entry
    ORDER BY
        tabAttendance.attendance_date;
    """
   
    ename = frappe.db.sql(query, (from_date, to_date, employee, company, company), as_dict=True)

    return ename


from datetime import datetime, timedelta
from frappe import _
from frappe.utils import nowdate, getdate

@frappe.whitelist()
def update_employee_status(name, employee_id, is_checked, from_date, to_date):
    
    is_checked = is_checked.lower() in ['true', '1', 'yes']
    
    
    status_value = 1 if is_checked else 0
    
    month_start_date = datetime.strptime(from_date, '%Y-%m-%d').replace(day=1)
    
    # Get the last day of the month of to_date
    next_month = datetime.strptime(to_date, '%Y-%m-%d').replace(day=1)
    month_end_date = next_month - timedelta(days=1)
    
    # Count the number of custom_allow_late_entry_relaxation entries made in the current month
    relaxation_count = frappe.db.count('Attendance', {
        'employee': employee_id,
        'attendance_date': ('between', [from_date, to_date]),
        'custom_allow_late_entry_relaxation': 1,
    })

    # Get the late entry limit from HR Settings
    lateentry_limit = frappe.get_doc("HR Settings")

    # Check the current state of the checkbox in the database
    current_state = frappe.db.get_value('Attendance', name, 'custom_allow_late_entry_relaxation')

    # If the checkbox is being checked
    if status_value == 1:
        # If the count is already equal to or greater than the allowed limit, raise an error
        if relaxation_count >= lateentry_limit.custom_late_entry_relaxation:
            frappe.throw(
                _("<span style='font-size:13px;'> Late Entry Deduction is allowed for only {0} days</span>").format(lateentry_limit.custom_late_entry_relaxation),
                title="Limit Exceeded"
            )

    # Update the Attendance document if all checks are passed
    frappe.db.set_value('Attendance', {'name': name}, 'custom_allow_late_entry_relaxation', status_value)
