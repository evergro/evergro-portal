import frappe

def get_context(context):
    if frappe.session.user != "Guest":
        # already logged in — let role_home_page decide where they land
        frappe.local.flags.redirect_location = "/"
        raise frappe.Redirect

    context.no_cache = 1
    context.title = "Sign In | Evergro Landscapers"