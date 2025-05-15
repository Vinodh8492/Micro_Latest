from pymodbus.client import ModbusTcpClient
from datetime import datetime

SCALE_IP = "192.168.10.21"
SCALE_PORT = 502
UNIT_ID = 1
WEIGHT_REGISTER = 0  # 40001 --> 0
ERROR_CODE_REGISTER = 1  # 40002 --> 1

ERROR_MESSAGES = {
    0: "OK",
    1: "Overload",
    2: "Underload",
    3: "Calibration Error",
    4: "Communication Fault",
    5: "Mechanical Fault",
}


def read_scale_data():
    try:
        client = ModbusTcpClient(SCALE_IP, port=SCALE_PORT, timeout=3)
        connection = client.connect()
        if not connection:
            client.close()
            raise Exception("Unable to connect to scale")

        weight_result = client.read_holding_registers(
            address=WEIGHT_REGISTER, count=1, slave=UNIT_ID
        )
        error_result = client.read_holding_registers(
            address=ERROR_CODE_REGISTER, count=1, slave=UNIT_ID
        )

        client.close()

        if weight_result.isError() or error_result.isError():
            raise Exception("Error reading register from scale")

        weight = weight_result.registers[0]
        error_code = error_result.registers[0]
        error_message = ERROR_MESSAGES.get(error_code, "Unknown Error")

        timestamp = datetime.now().isoformat()

        return {
            "timestamp": timestamp,
            "weight": weight,
            "error_code": error_code,
            "error_message": error_message,
        }

    except Exception as e:
        return {"error": str(e)}
