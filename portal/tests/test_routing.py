import frappe
from frappe.tests.utils import FrappeTestCase

from portal.routing import get_dashboard_url


class TestRouting(FrappeTestCase):
	def test_customer_goes_to_portal(self):
		customer = frappe.db.get_value("User", {"user_type": "Website User"})
		if not customer:
			self.skipTest("No Website User on this site")
		self.assertEqual(get_dashboard_url(customer), "/portal")

	def test_staff_goes_to_desk(self):
		self.assertEqual(get_dashboard_url("Administrator"), "/app")
