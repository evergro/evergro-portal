import frappe


def _get_customer():
    contact_name = frappe.db.get_value(
        "Contact Email", {"email_id": frappe.session.user}, "parent"
    )
    if not contact_name:
        frappe.throw("No customer linked to this account")

    customer = frappe.db.get_value(
        "Dynamic Link",
        {"parent": contact_name, "link_doctype": "Customer"},
        "link_name",
    )
    if not customer:
        frappe.throw("No customer linked to this account")

    return customer, contact_name


@frappe.whitelist()
def get_profile():
    customer, contact_name = _get_customer()
    contact = frappe.get_doc("Contact", contact_name)
    return {
        "full_name": f"{contact.first_name} {contact.last_name or ''}".strip(),
        "email": frappe.session.user,
        "phone": contact.mobile_no or contact.phone,
        "birthday": contact.get("custom_birthday"),
        "customer_since": frappe.db.get_value("Customer", customer, "creation"),
    }


@frappe.whitelist()
def update_profile(first_name=None, last_name=None, phone=None, birthday=None):
    customer, contact_name = _get_customer()
    contact = frappe.get_doc("Contact", contact_name)

    if first_name:
        contact.first_name = first_name
    if last_name is not None:
        contact.last_name = last_name
    if phone:
        contact.mobile_no = phone
    if birthday is not None:
        contact.custom_birthday = birthday

    contact.save(ignore_permissions=True)
    return {"status": "ok"}


@frappe.whitelist()
def get_addresses():
    customer, _ = _get_customer()
    addresses = frappe.get_all(
        "Dynamic Link",
        filters={"link_doctype": "Customer", "link_name": customer, "parenttype": "Address"},
        pluck="parent",
    )
    return [frappe.get_doc("Address", a).as_dict() for a in addresses]


@frappe.whitelist()
def get_invoices():
    customer, _ = _get_customer()
    return frappe.get_all(
        "Sales Invoice",
        filters={"customer": customer, "docstatus": 1},
        fields=["name", "posting_date", "grand_total", "status", "outstanding_amount"],
        order_by="posting_date desc",
    )

@frappe.whitelist()
def get_payment_methods():
    customer, _ = _get_customer()
    return frappe.get_all(
        "Paystack Customer Authorization",
        filters={"customer": customer, "active": 1},
        fields=["name", "brand", "card_type", "last_4_digits", "expiry_month",
                "expiry_year", "custom_default"],
        order_by="custom_is_default desc, creation desc",
    )


@frappe.whitelist()
def set_default_payment_method(name):
    customer, _ = _get_customer()
    owner = frappe.db.get_value("Paystack Customer Authorization", name, "customer")
    if owner != customer:
        frappe.throw("Not permitted", frappe.PermissionError)

    frappe.db.set_value(
        "Paystack Customer Authorization",
        {"customer": customer},
        "custom_is_default", 0,
    )
    frappe.db.set_value("Paystack Customer Authorization", name, "custom_default", 1)
    return {"status": "ok"}


@frappe.whitelist()
def remove_payment_method(name):
    customer, _ = _get_customer()
    owner = frappe.db.get_value("Paystack Customer Authorization", name, "customer")
    if owner != customer:
        frappe.throw("Not permitted", frappe.PermissionError)

    frappe.db.set_value("Paystack Customer Authorization", name, "active", 0)
    return {"status": "ok"}