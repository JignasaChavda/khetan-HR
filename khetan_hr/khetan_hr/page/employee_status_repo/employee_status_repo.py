import frappe
from frappe.utils.data import today

@frappe.whitelist()
def employee_data(employee=None, from_date=None, to_date=None, employee_type=None, status=None):
    sql_query = """
    SELECT 
    employee as ID,
    IFNULL(custom_office_or_plant, '') as office_or_plant,
    status as status,
    employee_name as full_name,
    employee_type as employee_type,
    COALESCE(NULLIF(department, ''), '') as department,
    COALESCE(NULLIF(plant, ''), '') as plant,
    DATE_FORMAT(date_of_joining, '%d/%m/%Y') as date_of_joining,
    COALESCE(DATE_FORMAT(relieving_date, '%d/%m/%Y'), '') as relieving_date 
    FROM `tabEmployee`
    WHERE 1=1
    """
    
    if employee:
        sql_query += f" AND employee = '{employee}'"
        
    if from_date and not to_date:
        sql_query += f" AND (date_of_joining >= '{from_date}' OR relieving_date >= '{from_date}')"
    elif to_date and not from_date: 
        sql_query += f" AND (date_of_joining <= '{to_date}' OR relieving_date <= '{to_date}')"
    elif from_date and to_date:
        sql_query += f" AND ((date_of_joining >= '{from_date}' AND date_of_joining <= '{to_date}') OR (relieving_date >= '{from_date}' AND relieving_date <= '{to_date}'))"
        
    if employee_type:
        sql_query += f" AND employee_type = '{employee_type}'"
    if status:
        sql_query += f" AND status='{status}'"        
        
    data = frappe.db.sql(sql_query, as_dict=True)
    
    employee_photos = get_employee_profile_photos()

    for employee_record in data:
        for photo in employee_photos:
            if employee_record["full_name"] == photo["employee_name"]:
                employee_record["photo_url"] = photo["photo_url"]
                break
        else:
            employee_record["photo_url"] = None
    print('\n\n\n',data,'\n\n\n')
    return data

   


def get_employee_profile_photos():
    employees = frappe.get_all("Employee", fields=["name", "employee_name"])
    
    employee_photos = []

   
    for employee in employees:
        photo_attachment = frappe.get_all("File", filters={"attached_to_name": employee.name, "attached_to_doctype": "Employee"}, fields=["file_url"], limit=1)

        if photo_attachment:
            path = photo_attachment[0].file_url
            employee_photos.append({"employee_name": employee.employee_name, "photo_url": path})
        else:
            employee_photos.append({"employee_name": employee.employee_name, "photo_url": None})

    return employee_photos
