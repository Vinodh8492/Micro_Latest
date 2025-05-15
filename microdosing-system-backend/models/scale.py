from pymodbus.client import ModbusTcpClient
from pymodbus.payload import BinaryPayloadDecoder
from pymodbus.constants import Endian


class ScaleClient:
    def __init__(self, host="localhost", port=502):
        self.host = host
        self.port = port

    def get_net_weight(self):
        """Get the net weight from register 40003 (address 2)"""
        client = ModbusTcpClient(self.host, port=self.port)
        try:
            result = client.read_holding_registers(address=2, count=2, slave=1)
            if not result.isError():
                decoder = BinaryPayloadDecoder.fromRegisters(
                    result.registers, byteorder=Endian.BIG, wordorder=Endian.BIG
                )
                return round(decoder.decode_32bit_float(), 2)
            return None
        except Exception as e:
            print(f"Error reading net weight: {str(e)}")
            return None
        finally:
            client.close()

    def get_scale_values(self):
        client = ModbusTcpClient(self.host, port=self.port)
        try:
            # Read weights in separate calls to avoid alignment issues
            # Gross (40001-40002) - address 0
            gross_result = client.read_holding_registers(address=0, count=2, slave=1)
            # Tare (40003-40004) - address 2
            tare_result = client.read_holding_registers(address=2, count=2, slave=1)
            # Net (40003-40004) - same as tare (calculated as gross - tare)
            net_result = client.read_holding_registers(address=2, count=2, slave=1)

            if not gross_result.isError() and not tare_result.isError():
                # Decode weights
                gross_decoder = BinaryPayloadDecoder.fromRegisters(
                    gross_result.registers, byteorder=Endian.BIG, wordorder=Endian.BIG
                )
                tare_decoder = BinaryPayloadDecoder.fromRegisters(
                    tare_result.registers, byteorder=Endian.BIG, wordorder=Endian.BIG
                )
                net_decoder = BinaryPayloadDecoder.fromRegisters(
                    net_result.registers, byteorder=Endian.BIG, wordorder=Endian.BIG
                )

                gross = round(gross_decoder.decode_32bit_float(), 2)
                tare = round(tare_decoder.decode_32bit_float(), 2)
                net = round(net_decoder.decode_32bit_float(), 2)

                # Read alarms (addresses 3-6 for 40004-40007)
                alarm_result = client.read_holding_registers(
                    address=3, count=4, slave=1
                )
                alarms = {
                    "overrange": bool(alarm_result.registers[0])
                    if not alarm_result.isError()
                    else False,
                    "underrange": bool(alarm_result.registers[1])
                    if not alarm_result.isError()
                    else False,
                    "motion": bool(alarm_result.registers[2])
                    if not alarm_result.isError()
                    else False,
                    "negative": bool(alarm_result.registers[3])
                    if not alarm_result.isError()
                    else False,
                }

                return {
                    "gross_weight": gross,
                    "tare_weight": tare,
                    "net_weight": net,
                    "alarms": alarms,
                }
            return None
        except Exception as e:
            print(f"Error reading scale values: {str(e)}")
            return None
        finally:
            client.close()
