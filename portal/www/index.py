import frappe


def get_context(context):
    # The button label depends on whether someone is logged in, so don't cache the page
    context.no_cache = 1
    context.title = "Evergro Landscapers | Lawn care & landscaping in Gauteng"
    context.logged_in = frappe.session.user != "Guest"