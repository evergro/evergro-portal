import frappe

from portal.routing import get_dashboard_url

no_cache = 1


def get_context(context):
	if frappe.session.user != "Guest":
		frappe.local.flags.redirect_location = get_dashboard_url(frappe.session.user)
		raise frappe.Redirect

	context.title = "Sign In | Evergro Landscapers"
