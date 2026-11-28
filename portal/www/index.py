import frappe

from portal.routing import get_dashboard_url

no_cache = 1


def get_context(context):
	context.title = "Evergro Landscapers | Lawn care & landscaping in Gauteng"
	context.is_logged_in = frappe.session.user != "Guest"
	context.dashboard_url = get_dashboard_url(frappe.session.user) if context.is_logged_in else "/login"
