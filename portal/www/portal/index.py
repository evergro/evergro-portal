import json
import os

import frappe
from frappe import _

no_cache = 1


def get_boot() -> dict:
	return {"csrf_token": frappe.sessions.get_csrf_token()}


def get_context(context):
	path = frappe.local.request.path
	if path.startswith("/portal") and frappe.session.user == "Guest":
		frappe.local.flags.redirect_location = f"/login?redirect-to={path}"
		raise frappe.Redirect

	context.boot = get_boot()
	context.js_file, context.css_files = get_built_files()


def get_built_files():
	manifest_path = frappe.get_app_path("portal", "public", "portal", ".vite", "manifest.json")
	if not os.path.exists(manifest_path):
		return None, []
	with open(manifest_path) as manifest_file:
		entry = json.load(manifest_file).get("index.html", {})
	return entry.get("file"), entry.get("css", [])


@frappe.whitelist(allow_guest=True)
def get_context_for_dev():
	# Guests may call it because promo pages need no login. It exposes nothing a built page does not.
	if not frappe.conf.developer_mode:
		frappe.throw(_("This is for development only."))
	return get_boot()
