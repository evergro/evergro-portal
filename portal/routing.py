import frappe


def get_dashboard_url(user: str) -> str:
	if frappe.db.get_value("User", user, "user_type") == "Website User":
		return "/portal"
	return "/app"
