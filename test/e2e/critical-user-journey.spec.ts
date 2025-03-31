import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('main')).toContainText('What is Inflation?');
  await expect(page.getByRole('main')).toContainText('Quick Calculator');
  await page.getByRole('spinbutton', { name: 'Enter your original salary' }).fill('2000');
  await expect(page.getByRole('heading', { name: 'Result' })).toBeVisible();
  await page.getByRole('link', { name: 'Try Our Full Simulator →' }).click();
  await expect(page.getByText('Enter Your Salary HistoryDateMonthly Salary$Remove+ Add Another Salary')).toBeVisible();

  await page.getByRole('textbox', { name: 'Salary change date' }).fill('2020-03');
  await page.getByRole('spinbutton', { name: 'Salary amount' }).fill('2000');
  await page.getByRole('button', { name: '+ Add Another Salary Change' }).click();
  await page.getByRole('textbox', { name: 'Salary change date 2' }).fill('2023-06');
  await page.getByRole('spinbutton', { name: 'Salary amount 2' }).fill('2800');
  await page.getByRole('button', { name: '+ Add Another Salary Change' }).click();
  await page.getByRole('textbox', { name: 'Salary change date 3' }).fill('2023-12');
  await page.getByRole('spinbutton', { name: 'Salary amount 3' }).fill('3200');
  await page.getByLabel('Select your country').selectOption('JPN');
  await page.getByRole('button', { name: 'Calculate Inflation Impact' }).click();
  await expect(page.getByTestId('result')).toBeVisible();
  await expect(page.getByText('Impact Summary')).toBeVisible();
  await page.getByText('Learn more about inflation').click();
  await expect(page.getByText('What is inflation? Inflation')).toBeVisible();
});