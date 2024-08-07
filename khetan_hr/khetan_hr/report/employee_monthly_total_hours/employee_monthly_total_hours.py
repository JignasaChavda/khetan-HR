import calendar
import frappe
from frappe.utils import get_first_day, get_last_day

def get_month_number(month_name):
    return list(calendar.month_name).index(month_name)

def convert_to_hours_and_minutes(total_hours_list):
    total_minutes = 0
    for total_hour in total_hours_list:
        if total_hour:
            if '.' in total_hour:
                hours, minutes = map(int, total_hour.split('.'))
                total_minutes += hours * 60 + minutes
            else:
                total_minutes += int(total_hour) * 60

    total_hours = total_minutes // 60
    remaining_minutes = total_minutes % 60
    return f"{total_hours}.{remaining_minutes:02d}"

def execute(filters=None):
    if not filters:
        filters = {}

    month = filters.get("month")
    year = int(filters.get("year", 0))
    employee = filters.get("employee")

    if not month or not year:
        return [], []

    month_number = get_month_number(month)
    start_date = get_first_day(f"{year}-{month_number}-01")
    end_date = get_last_day(f"{year}-{month_number}-01")

    conditions = "attendance_date >= %s AND attendance_date <= %s"
    values = [start_date, end_date]

    if employee:
        conditions += " AND employee = %s"
        values.append(employee)

    data = frappe.db.sql("""
        SELECT 
            employee,
            employee_name,
            GROUP_CONCAT(custom_total_hours) AS custom_total_hours,
            GROUP_CONCAT(new_hours) AS work_hours,
            GROUP_CONCAT(overtime) AS overtime
                        
        FROM 
            `tabAttendance`
        WHERE
            {conditions}
        GROUP BY
            employee
    """.format(conditions=conditions), values, as_dict=1)

    for row in data:
        total_hours_list = row['custom_total_hours'].split(',') if row['custom_total_hours'] else []
        work_hours = row['work_hours'].split(',') if row['work_hours'] else []
        overtime = row['overtime'].split(',') if row['overtime'] else []
        row['total_hours'] = convert_to_hours_and_minutes(total_hours_list)
        row['work_hours'] = convert_to_hours_and_minutes(work_hours)
        row['overtime'] = convert_to_hours_and_minutes(overtime)

    columns = [
        {
            "label": ("Employee"),
            "fieldname": "employee",
            "fieldtype": "Data",
            "width": 150
        },
        {
            "label": ("Employee Name"),
            "fieldname": "employee_name",
            "fieldtype": "Data",
            "width": 200
        },
        {
            "label": ("Total Hours"),
            "fieldname": "total_hours",
            "fieldtype": "Data",
            "width": 120
        },
        {
            "label": ("Work Hours"),
            "fieldname": "work_hours",
            "fieldtype": "Data",
            "width": 120
        },
        {
            "label": ("Overtime"),
            "fieldname": "overtime",
            "fieldtype": "Data",
            "width": 120
        }
    ]

    return columns, data
