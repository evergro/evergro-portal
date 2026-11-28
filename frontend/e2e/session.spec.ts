import { expect, test } from '@playwright/test'
import { customer, login } from './helpers'

test.skip(!customer.email, 'E2E_CUSTOMER_EMAIL is not set')

test('an expired session on /portal/schedule ends on /login', async ({ page, context }) => {
  await login(page, customer)
  await page.goto('/portal/schedule')
  await context.clearCookies()
  // The next profile request answers 403 and the app sends the user to login. It can happen before or after this click.
  await page.getByRole('link', { name: 'Account' }).first().click({ timeout: 3000 }).catch(() => {})
  await expect(page).toHaveURL(/\/login\?redirect-to=%2Fportal%2F(schedule|account)/)
})

test('logout from the account page ends on / and /portal then needs login', async ({ page }) => {
  await login(page, customer)
  await page.goto('/portal/account')
  await page.getByRole('button', { name: 'Log out' }).first().click()
  await page.getByRole('button', { name: 'Log out' }).last().click()
  await expect(page).toHaveURL(/\/$/)
  await page.goto('/portal')
  await expect(page).toHaveURL(/\/login\?redirect-to=\/portal/)
})
