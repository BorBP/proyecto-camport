"""
Cliente API para comunicación con el backend
Envía datos de telemetría al servidor Camport
"""

import requests
import json
from colorama import Fore, Style, init

# Inicializar colorama para colores en consola
init(autoreset=True)


class APIClient:
    """
    Cliente HTTP para enviar datos de telemetría al backend
    """

    def __init__(self, backend_config):
        """
        Inicializa el cliente API

        Args:
            backend_config (dict): Configuración del backend (url, endpoint, timeout)
        """
        self.base_url = backend_config['url']
        self.endpoint = backend_config['endpoint']
        self.timeout = backend_config['timeout']
        self.full_url = self.base_url + self.endpoint

        print(f"🌐 Cliente API inicializado: {self.full_url}")


    def enviar_telemetria(self, datos):
        """
        Envía datos de telemetría al backend

        Args:
            datos (dict): Payload JSON con datos del collar

        Returns:
                tuple: (success: bool, response: dict)
        """
        try:
            response = requests.post(
                self.full_url,
                json=datos,
                headers={
                    'Content-Type': 'application/json',
                    'User-Agent': 'CamportIoTSimulator/1.0'
                },
                timeout=self.timeout
            )

            if response.status_code == 201:
                return True, response.json()
            else:
                return False, {
                    'error': f"HTTP {response.status_code}",
                    'message': response.text
                }

        except requests.exceptions.ConnectionError:
            return False, {'error': 'No se pudo conectar al backend'}
        except requests.exceptions.Timeout:
            return False, {'error': 'Timeout en la conexión'}
        except Exception as e:
            return False, {'error': str(e)}


    def enviar_batch(self, lista_datos):
        """
        Envía múltiples datos de telemetría en lote

        Args:
            lista_datos (list): Lista de payloads JSON

        Returns:
                dict: Resumen de envíos exitosos y fallidos
        """
        exitosos = 0
        fallidos = 0

        for datos in lista_datos:
            success, _ = self.enviar_telemetria(datos)
            if success:
                exitosos += 1
            else:
                fallidos += 1

        return {
                'exitosos': exitosos,
                'fallidos': fallidos,
                'total': len(lista_datos)
            }


    def verificar_conexion(self):
        """
        Verifica que el backend esté disponible

        Returns:
            bool: True si el backend responde, False si no
        """
        try:
            response = requests.get(
                self.base_url + '/api',
                headers={'User-Agent': 'CamportIoTSimulator/1.0'},
                timeout=self.timeout
            )
            return response.status_code in [200, 404]  # 404 también indica que el servidor está vivo
        except:
            return False


    @staticmethod
    def imprimir_resultado(collar_id, success, response):
        """
        Imprime el resultado del envío con colores

        Args:
            collar_id (str): ID del collar
            success (bool): Si el envío fue exitoso
            response (dict): Respuesta del servidor
        """
        if success:
            print(f"{Fore.GREEN}✓ {collar_id}: Telemetría enviada exitosamente{Style.RESET_ALL}")
        else:
            error = response.get('error', 'Error desconocido')
            print(f"{Fore.RED}✗ {collar_id}: {error}{Style.RESET_ALL}")