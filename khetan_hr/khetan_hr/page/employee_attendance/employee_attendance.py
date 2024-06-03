

import frappe
from datetime import datetime


@frappe.whitelist()
def get_lwf_details(from_date=None, to_date=None, company=None, department=None, status=None,employee_type=None):
   query = """
   SELECT
       DISTINCT tabAttendance.working_hours,
       tabEmployee.employee,
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
       tabAttendance.custom_early_exit,
       tabAttendance.custom_remarks,
       tabAttendance.custom_employee_type,
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
       AND (%s IS NULL OR tabEmployee.company = %s)
       AND (%s IS NULL OR tabEmployee.department = %s)
        
       {status_condition} 
        AND (%s IS NULL OR tabAttendance.custom_employee_type = %s) -- Add this line for status filtering
   ORDER BY
       tabAttendance.attendance_date;
"""


   # Determine if the status condition should be included
   status_condition = "AND tabAttendance.status = %s" if status is not None and status != '' else ""


   # Format the query with the status condition
   query = query.format(status_condition=status_condition)


   # Execute the queries
   if status is not None and status != '':
       ename = frappe.db.sql(query, (from_date, to_date, company, company, department, department, status,employee_type,employee_type), as_dict=True)
   else:
       ename = frappe.db.sql(query, (from_date, to_date, company, company, department, department,employee_type,employee_type), as_dict=True)


   # Further processing or combining of results can be done here


   return ename


