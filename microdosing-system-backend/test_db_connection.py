import mysql.connector
from dotenv import load_dotenv
import os

# Load the environment variables from .env
load_dotenv()

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password=os.getenv("DB_PASSWORD", "Inferdata@123"),
        database="microdosing_system",
    )
    print("✅ Connected to MySQL Database successfully.")
    conn.close()
except mysql.connector.Error as err:
    print(f"❌ Failed to connect: {err}")
