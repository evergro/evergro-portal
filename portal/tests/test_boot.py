import frappe
from frappe.tests.utils import FrappeTestCase

from portal.www.portal.index import get_context_for_dev


class TestBoot(FrappeTestCase):
	def test_dev_boot_refuses_when_developer_mode_is_off(self):
		original = frappe.conf.developer_mode
		frappe.conf.developer_mode = 0
		try:
			with self.assertRaises(frappe.ValidationError):
				get_context_for_dev()
		finally:
			frappe.conf.developer_mode = original

	def test_dev_boot_returns_csrf_token_in_developer_mode(self):
		frappe.conf.developer_mode = 1
		self.assertIn("csrf_token", get_context_for_dev())
