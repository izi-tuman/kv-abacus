"""
Скрипт для создания скриншотов приложения и генерации PPTX презентации.
"""
import asyncio
import os
from playwright.async_api import async_playwright
from PIL import Image

SCREENSHOTS_DIR = os.path.join(os.path.dirname(__file__), "screenshots")
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

BASE_URL = "http://localhost:3001"

async def take_screenshot(page, selector, filename, wait_time=2000):
    """Делает скриншот конкретного элемента."""
    await page.wait_for_timeout(wait_time)
    await page.wait_for_selector(selector, timeout=10000)
    element = await page.query_selector(selector)
    if element:
        path = os.path.join(SCREENSHOTS_DIR, filename)
        await element.screenshot(path=path, type="png")
        print(f"✓ {filename}")
        return path
    print(f"✗ Не найден элемент: {selector}")
    return None

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 390, "height": 844},
            device_scale_factor=2,
        )
        page = await context.new_page()

        # Логин
        print("Логин...")
        await page.goto(BASE_URL, wait_until="networkidle")
        await page.wait_for_timeout(1000)
        
        # Проверяем, нужно ли логиниться
        current_url = page.url
        if "login" in current_url.lower() or "splash" in current_url.lower():
            try:
                await page.wait_for_selector('input[placeholder*="Логин"], input[placeholder*="login"], input[type="text"]', timeout=5000)
                inputs = await page.query_selector_all('input')
                if len(inputs) >= 2:
                    await inputs[0].fill("admin")
                    await inputs[1].fill("admin")
                    buttons = await page.query_selector_all('button')
                    for btn in buttons:
                        text = await btn.inner_text()
                        if "войти" in text.lower() or "вход" in text.lower():
                            await btn.click()
                            break
                    await page.wait_for_timeout(2000)
            except Exception as e:
                print(f"Логин не удал: {e}")

        # 1. Главная - календарь (недельный вид)
        print("\nКалендарь (неделя)...")
        try:
            await page.goto(BASE_URL, wait_until="networkidle")
            await page.wait_for_timeout(3000)
            # Скриншот всей страницы календаря
            path = os.path.join(SCREENSHOTS_DIR, "calendar-week.png")
            await page.screenshot(path=path, full_page=False)
            print(f"✓ calendar-week.png")
        except Exception as e:
            print(f"✗ calendar-week.png: {e}")

        # 2. Дневной вид календаря
        print("\nКалендарь (день)...")
        try:
            # Переключаем на дневной вид
            buttons = await page.query_selector_all('button')
            for btn in buttons:
                text = await btn.inner_text()
                if "день" in text.lower():
                    await btn.click()
                    break
            await page.wait_for_timeout(2000)
            path = os.path.join(SCREENSHOTS_DIR, "calendar-day.png")
            await page.screenshot(path=path, full_page=False)
            print(f"✓ calendar-day.png")
        except Exception as e:
            print(f"✗ calendar-day.png: {e}")

        # 3. Модальное окно бронирования
        print("\nМодалка бронирования...")
        try:
            # Кликаем на кнопку создания
            buttons = await page.query_selector_all('button')
            for btn in buttons:
                text = await btn.inner_text()
                if "новое" in text.lower() or "создать" in text.lower() or "+" in text:
                    await btn.click()
                    break
            await page.wait_for_timeout(2000)
            # Скриншот модалки
            modal = await page.query_selector('[role="dialog"], .modal-sheet, [class*="modal"]')
            if modal:
                path = os.path.join(SCREENSHOTS_DIR, "booking-modal.png")
                await modal.screenshot(path=path, type="png")
                print(f"✓ booking-modal.png")
            else:
                path = os.path.join(SCREENSHOTS_DIR, "booking-modal.png")
                await page.screenshot(path=path, full_page=False)
                print(f"✓ booking-modal.png (fallback)")
        except Exception as e:
            print(f"✗ booking-modal.png: {e}")

        # 4. Клиенты
        print("\nКлиенты...")
        try:
            await page.goto(f"{BASE_URL}/clients", wait_until="networkidle")
            await page.wait_for_timeout(3000)
            path = os.path.join(SCREENSHOTS_DIR, "clients.png")
            await page.screenshot(path=path, full_page=False)
            print(f"✓ clients.png")
        except Exception as e:
            print(f"✗ clients.png: {e}")

        # 5. Дома
        print("\nДома...")
        try:
            await page.goto(f"{BASE_URL}/houses", wait_until="networkidle")
            await page.wait_for_timeout(3000)
            path = os.path.join(SCREENSHOTS_DIR, "houses.png")
            await page.screenshot(path=path, full_page=False)
            print(f"✓ houses.png")
        except Exception as e:
            print(f"✗ houses.png: {e}")

        # 6. Прокат
        print("\nПрокат...")
        try:
            await page.goto(f"{BASE_URL}/rental", wait_until="networkidle")
            await page.wait_for_timeout(3000)
            path = os.path.join(SCREENSHOTS_DIR, "rental.png")
            await page.screenshot(path=path, full_page=False)
            print(f"✓ rental.png")
        except Exception as e:
            print(f"✗ rental.png: {e}")

        # 7. Услуги
        print("\nУслуги...")
        try:
            await page.goto(f"{BASE_URL}/more/services", wait_until="networkidle")
            await page.wait_for_timeout(3000)
            path = os.path.join(SCREENSHOTS_DIR, "services.png")
            await page.screenshot(path=path, full_page=False)
            print(f"✓ services.png")
        except Exception as e:
            print(f"✗ services.png: {e}")

        # 8. Снаряжение
        print("\nСнаряжение...")
        try:
            await page.goto(f"{BASE_URL}/more/equipment", wait_until="networkidle")
            await page.wait_for_timeout(3000)
            path = os.path.join(SCREENSHOTS_DIR, "equipment.png")
            await page.screenshot(path=path, full_page=False)
            print(f"✓ equipment.png")
        except Exception as e:
            print(f"✗ equipment.png: {e}")

        # 9. История бронирований
        print("\nИстория...")
        try:
            await page.goto(f"{BASE_URL}/more/history", wait_until="networkidle")
            await page.wait_for_timeout(3000)
            path = os.path.join(SCREENSHOTS_DIR, "history.png")
            await page.screenshot(path=path, full_page=False)
            print(f"✓ history.png")
        except Exception as e:
            print(f"✗ history.png: {e}")

        # 10. Отчёты - финансовый
        print("\nОтчёты...")
        try:
            await page.goto(f"{BASE_URL}/more/reports", wait_until="networkidle")
            await page.wait_for_timeout(3000)
            # Скриншот до генерации
            path = os.path.join(SCREENSHOTS_DIR, "reports-form.png")
            await page.screenshot(path=path, full_page=False)
            print(f"✓ reports-form.png")
            
            # Генерируем отчёт
            buttons = await page.query_selector_all('button')
            for btn in buttons:
                text = await btn.inner_text()
                if "сгенерировать" in text.lower():
                    await btn.click()
                    break
            await page.wait_for_timeout(3000)
            path = os.path.join(SCREENSHOTS_DIR, "reports-finance.png")
            await page.screenshot(path=path, full_page=False)
            print(f"✓ reports-finance.png")
        except Exception as e:
            print(f"✗ reports: {e}")

        # 11. Настройки / Ещё
        print("\nСтраница Ещё...")
        try:
            await page.goto(f"{BASE_URL}/more", wait_until="networkidle")
            await page.wait_for_timeout(3000)
            path = os.path.join(SCREENSHOTS_DIR, "more-page.png")
            await page.screenshot(path=path, full_page=False)
            print(f"✓ more-page.png")
        except Exception as e:
            print(f"✗ more-page.png: {e}")

        await browser.close()
        print("\n✓ Все скриншоты сохранены в:", SCREENSHOTS_DIR)

if __name__ == "__main__":
    asyncio.run(main())
