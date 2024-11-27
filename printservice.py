import subprocess
import time
import os

def push_image_to_phone(image_name):
    """
    Pushes the specified image to the phone's Pictures folder and refreshes the media database.
    """
    source_path = os.path.join("generated_images", image_name)
    target_directory = "/storage/emulated/0/Pictures/"
    
    # Step 1: Push the image to the phone
    print(f"Pushing image {image_name} to the phone...")
    subprocess.run(["adb", "push", source_path, target_directory], check=True)
    print(f"Image {image_name} pushed successfully to {target_directory}")

    # Step 2: Refresh media database
    print("Refreshing media database...")
    subprocess.run(["adb", "shell", "am", "broadcast", "-a", "android.intent.action.MEDIA_SCANNER_SCAN_FILE", "-d", f"file://{target_directory}{image_name}"], check=True)
    print("Media database refreshed successfully")

def kill_all_apps():
    print("Killing all background apps...")
    command = ["adb", "shell", "am", "kill-all"]
    subprocess.run(command, check=True)
    print("All background apps killed successfully")

def go_to_home_screen():
    print("Returning to home screen...")
    command = ["adb", "shell", "input", "keyevent", "KEYCODE_HOME"]
    subprocess.run(command, check=True)
    print("Returned to home screen successfully")

def simulate_tap(x, y):
    print(f"Simulating tap on ({x}, {y})")  # Debugging output
    command = ["adb", "shell", "input", "tap", str(x), str(y)]
    subprocess.run(command, check=True)
    print(f"Tapped on ({x}, {y}) successfully")

def automate_printing_workflow(image_name):
    """
    Orchestrates the entire workflow: pushes image, prepares phone, and triggers printing.
    """
    # Step 1: Push the image to the phone and refresh media
    push_image_to_phone(image_name)

    # Step 2: Kill all background apps
    kill_all_apps()
    time.sleep(1)

    # Step 3: Ensure we're on the home screen
    go_to_home_screen()
    time.sleep(1)

    # Step 4: Open the HP Sprocket Panorama app
    print("Opening HP Sprocket Panorama app...")
    subprocess.run(["adb", "shell", "am", "start", "-n", "com.hp.impulse.panorama/.activity.SplashActivity"], check=True)
    print("Opened HP Sprocket app")

    # Step 5: Wait for the app to load
    time.sleep(3)

    # Step 6: Simulate taps
    simulate_tap(558, 1911)  # Print Photo button (quick print)
    time.sleep(2)
    simulate_tap(160, 480)  # Select image
    time.sleep(2)
    simulate_tap(995, 240)  # Hit the next button
    time.sleep(3)
    simulate_tap(1000, 226)  # Hit the print icon
    time.sleep(2)
    simulate_tap(550, 2140)  # Hit the print button (bottom middle)
    print("Automated printing workflow completed")

    # Step 7: Wait 40 seconds for the print job to process
    print("Waiting 40 seconds for the print job...")
    time.sleep(40)

    # Step 8: Kill the HP Sprocket Panorama app
    print("Killing HP Sprocket app...")
    subprocess.run(["adb", "shell", "am", "force-stop", "com.hp.impulse.panorama"], check=True)
    print("HP Sprocket app killed. Ready for the next session.")

# Test script
if __name__ == "__main__":
    # Replace with the name of an image file in your generated_images folder
    test_image_name = "session-1731455785816-1731455801923.png"
    automate_printing_workflow(test_image_name)
