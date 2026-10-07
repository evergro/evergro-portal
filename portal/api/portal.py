import os

import frappe

def _require_authenticated_user():
    user = frappe.session.user

    if not user or user == "Guest":
        frappe.throw(
            "Authentication required",
            frappe.PermissionError,
        )

    return user

def _get_customer():
    user = _require_authenticated_user()

    contact_name = frappe.db.get_value(
        "Contact Email",
        {"email_id": user},
        "parent",
    )

    if not contact_name:
        frappe.throw("No customer contact linked to this account", frappe.PermissionError)

    customer = frappe.db.get_value(
        "Dynamic Link",
        {
            "parent": contact_name,
            "parenttype": "Contact",
            "link_doctype": "Customer",
        },
        "link_name",
    )

    if not customer:
        frappe.throw("No customer linked to this account", frappe.PermissionError)

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
        "has_image": bool(contact.image),
    }

@frappe.whitelist()
def get_private_image(doctype, name):
    customer, contact_name = _get_customer()

    # Only allow images from doctypes we explicitly support.
    allowed_doctypes = {
        "Contact",
        "Address",
    }

    if doctype not in allowed_doctypes:
        frappe.throw("Not permitted", frappe.PermissionError)

    doc = frappe.get_doc(doctype, name)

    # Contact belongs to the logged-in customer
    if doctype == "Contact":
        if name != contact_name:
            frappe.throw("Not permitted", frappe.PermissionError)

    # Address belongs to the logged-in customer
    elif doctype == "Address":
        if not any(
            link.link_doctype == "Customer"
            and link.link_name == customer
            for link in doc.links
        ):
            frappe.throw("Not permitted", frappe.PermissionError)

    image_url = doc.get("image")

    if not image_url or not image_url.startswith("/private/files/"):
        frappe.throw("Image not found", frappe.DoesNotExistError)

    file_name = frappe.db.get_value(
        "File",
        {
            "file_url": image_url,
            "is_private": 1,
        },
        "name",
    )

    if not file_name:
        frappe.throw("Image file not found", frappe.DoesNotExistError)

    file_doc = frappe.get_doc("File", file_name)

    if (
        file_doc.attached_to_doctype != doctype
        or file_doc.attached_to_name != name
    ):
        frappe.throw("Not permitted", frappe.PermissionError)

    file_path = file_doc.get_full_path()

    if not os.path.isfile(file_path):
        frappe.throw("Image file not found", frappe.DoesNotExistError)

    with open(file_path, "rb") as f:
        content = f.read()

    frappe.local.response.filename = file_doc.file_name
    frappe.local.response.filecontent = content
    frappe.local.response.type = "download"
    frappe.local.response.content_type = file_doc.content_type or "image/jpeg"

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
        filters={
            "customer": customer,
            "active": 1,
        },
        fields=[
            "name",
            "brand",
            "card_type",
            "last4",
            "exp_month",
            "exp_year",
            "custom_default",
        ],
        order_by="custom_default desc, creation desc",
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
        "custom_default", 0,
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