import time
from utils.scale_connection import read_scale_data
from helpers.scale_helper import save_scale_data


def start_scale_reader(app):
    with app.app_context():
        while True:
            data = read_scale_data()

            if "error" not in data:
                save_scale_data(
                    weight=data["weight"],
                    error_code=data["error_code"],
                    error_message=data["error_message"],
                )
                print(
                    f"[Scale Reader] Saved weight: {data['weight']} at {data['timestamp']}"
                )
            else:
                print(f"[Scale Reader] Error reading scale: {data['error']}")

            time.sleep(1)
