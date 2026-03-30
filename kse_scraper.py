import os
from playwright.sync_api import sync_playwright

def login_to_ouderportaal(email: str, password: str):
    """
    Log into kse.ouderportaal.nl using Playwright and return the page content 
    after successful login.
    """
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=True)
        
        # Set viewport and a realistic user agent
        context = browser.new_context(
            viewport={'width': 1280, 'height': 800},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
        )
        page = context.new_page()

        print("Navigating to KSE Ouderportaal login page...")
        page.goto("https://kse.ouderportaal.nl/auth/login")
        
        print("Waiting for choice screen and selecting 'Inlog ouder'...")
        # The portal first asks whether you are an employee or a parent
        page.wait_for_selector("text=Inlog ouder", state="visible")
        page.click("text=Inlog ouder")

        print("Waiting for login form fields...")
        # Now wait for the actual username input to appear
        page.wait_for_selector('input[formcontrolname="username"]', state="visible")
        
        print("Filling in credentials...")
        page.fill('input[formcontrolname="username"]', email)
        page.fill('input[formcontrolname="password"]', password)
        
        print("Submitting login form...")
        # Click the inloggen button
        page.click('button#login-button')
        
        print("Waiting to land on dashboard...")
        # Wait a few seconds for the dashboard page or SPA navigation to settle
        try:
            page.wait_for_timeout(5000)
            page.wait_for_load_state("networkidle", timeout=10000)
        except Exception:
            pass # Ignore wait timeouts if page is already loaded enough
            
        print("Successfully logged in.")
        
        # Optional: capture a screenshot to verify
        os.makedirs("output", exist_ok=True)
        screenshot_path = "output/dashboard.png"
        page.screenshot(path=screenshot_path, full_page=True)
        print(f"Saved dashboard screenshot to {screenshot_path}")

        # Get the dashboard HTML content
        dashboard_html = page.content()
        
        browser.close()
        
        return dashboard_html

if __name__ == "__main__":
    EMAIL = "puddypudelko@hotmail.com"
    PASSWORD = "kyrry6-xaqcah-kacxoH"
    
    html = login_to_ouderportaal(EMAIL, PASSWORD)
    print("Scrape complete! HTML length:", len(html))
