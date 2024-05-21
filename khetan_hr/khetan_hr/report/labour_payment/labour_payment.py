from decimal import Decimal
from frappe.utils import flt
import frappe
import calendar

def get_month_number(month_name):
   return list(calendar.month_abbr).index(month_name.capitalize()[:3])

def round_to_nearest_hour(daily_hours):
    rounded_hour = 0
    if daily_hours:
        parts = daily_hours.split('.')
        if len(parts) == 2:
            hour = int(parts[0])
            minute = int(parts[1])
            
            if 0 <= minute < 30:
                rounded_hour = hour
            elif 30 <= minute <= 60:
                rounded_hour = hour + 1
        else:
            rounded_hour = int(daily_hours)
    return rounded_hour


    
def execute(filters=None):
   # Extract month and year from filters
   month = filters.get("month", "")
   year = int(filters.get("year", 0))

   # Ensure the month and year are provided
   if not month or not year:
       frappe.msgprint("Please select both month and year.")
       return [], []

   # Construct date range based on the selected month and year
   start_date = frappe.utils.get_datetime(f"{month}-01-{year}")
   end_date = frappe.utils.get_datetime(f"{month}-{calendar.monthrange(year, get_month_number(month))[1]}-{year}")

   # Fetch data from Attendance table with date range filter
   attendance_data = frappe.get_all("Attendance",
                                    filters={"attendance_date": ["between", [start_date, end_date]],"docstatus":1},
                                    fields=['employee', 'employee_name', 'attendance_date', 'new_hours'])


   exists_lab_sal = frappe.get_all(
        "Labour Salary Payment",
        filters={
            "from_date": ["<=", end_date], 
            "to_date": [">=", start_date],
            "docstatus": 1
        },
        fields=['name']
   )

   # Dictionary to store details for matched employees
   employee_details = {}

   for sal in exists_lab_sal:
        exists_lab_nm = sal['name']
        exists_doc = frappe.get_doc('Labour Salary Payment', exists_lab_nm)
        exists_pay_details = exists_doc.get('payment_details')
        
        for data in exists_pay_details:
            exists_emp = data.employee
            print("\n\n\n\n", data.total_hours,"\n\n")

            # Store payment details for matched employees
            employee_details[exists_emp] = {
                "daily_rate": data.daily_rate,
                "total_hours": data.total_hours,
                "payment": data.payment,
                "advance": data.advance,
                "canteen_deduction": data.canteen_deduction,
                "fine": data.fine,
                "prv_balance": data.prv_balance,
                "total_payment": data.total_payment,
                "cashpaid": data.cashpaid,
                "bankpaid": data.bankpaid,
                "remaining_balance": data.remaining_balance
            }

   # Group data by employee
   employee_data = {}
   for entry in attendance_data:
       employee_id = entry.employee
       if employee_id not in employee_data:
           employee_data[employee_id] = {
               "employee": entry.employee,
               "employee_name": entry.employee_name,
               "new_hours": {}
           }
       employee_data[employee_id]["new_hours"][entry.attendance_date.day] = entry.new_hours

   # Dynamically generate columns for each day in the selected month
   _, days_in_month = calendar.monthrange(year, get_month_number(month))
   columns = [
       {
           "label": "Employee",
           "fieldname": "employee",
           "fieldtype": "Link",
           "options": "Employee",
           "width": 100
       },
       {
           "label": "Employee Name",
           "fieldname": "employee_name",
           "fieldtype": "Data",
           "width": 300
       }
   ]

   # Add dynamic columns for each day in the selected month
   for day in range(1, days_in_month + 1):
       columns.append({
           "label": f"{day}",
           "fieldname": f"day_{day}_new_hours",
           "fieldtype": "Data",
           "width": 80
       })

   # Add columns for additional payment details
   additional_columns = [
       {"label": "Daily Rate", "fieldname": "daily_rate", "fieldtype": "Currency", "width": 100},
       {"label": "Total Hours", "fieldname": "total_hours", "fieldtype": "Float", "Precision": "2", "width": 100},
       {"label": "Payment", "fieldname": "payment", "fieldtype": "Currency", "width": 100},
       {"label": "Advance", "fieldname": "advance", "fieldtype": "Currency", "width": 100},
       {"label": "Canteen Deduction", "fieldname": "canteen_deduction", "fieldtype": "Currency", "width": 100},
       {"label": "Fine", "fieldname": "fine", "fieldtype": "Currency", "width": 100},
       {"label": "Previous Balance", "fieldname": "prv_balance", "fieldtype": "Currency", "width": 100},
       {"label": "Total Payment", "fieldname": "total_payment", "fieldtype": "Currency", "width": 100},
       {"label": "Cash Paid", "fieldname": "cashpaid", "fieldtype": "Currency", "width": 100},
       {"label": "Bank Paid", "fieldname": "bankpaid", "fieldtype": "Currency", "width": 100},
       {"label": "Remaining Balance", "fieldname": "remaining_balance", "fieldtype": "Currency", "width": 100}
   ]

   columns += additional_columns

   data = []

   # Populate data with attendance entries
   for employee_id, employee_info in employee_data.items():
       row = {
           "employee": employee_info["employee"],
           "employee_name": employee_info["employee_name"]
       }

       # Add new_hours for each day in the row and round the hour
       for day in range(1, days_in_month + 1):
           day_key = f"day_{day}_new_hours"
           new_hour_value = employee_info["new_hours"].get(day, "0")
           rounded_hour = round_to_nearest_hour(new_hour_value)
           row[day_key] = rounded_hour

       # Check if there are additional payment details for this employee
       if employee_id in employee_details:
           details = employee_details[employee_id]
           for key, value in details.items():
               row[key] = flt(value)
       else:
           # If no details found, set default values or leave them blank
           for column in additional_columns:
               row[column["fieldname"]] = 0

       data.append(row)

   return columns, data
