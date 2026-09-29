import frappe
import json
import os

def get_context(context):
    if frappe.session.user == "Guest":
        frappe.local.flags.redirect_location = "/login"
        raise frappe.Redirect

    context.no_cache = 1

    manifest_path = frappe.get_app_path("portal", "public", "portal", ".vite", "manifest.json")
    if os.path.exists(manifest_path):
        with open(manifest_path) as f:
            manifest = json.load(f)
        entry = manifest.get("index.html", {})
        context.js_file = entry.get("file")
        context.css_files = entry.get("css", [])
    else:
        context.js_file = None
        context.css_files = []