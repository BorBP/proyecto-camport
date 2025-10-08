"""
Utilidades y funciones auxiliares para el simulador
"""
import json
import os
from datetime import datetime
from colorama import Fore, Style


def cargar_configuracion(archivo='config.json'):
    """
    Carga la configuración desde el archivo JSON

    Args:
        archivo (str): Ruta al archivo de configuración

    Returns:
        dict: Configuración cargada
    """
    try:
        with open(archivo, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"{Fore.RED}❌ Error: No se encontró {archivo}{Style.RESET_ALL}")
        return None
    except json.JSONDecodeError:
        print(f"{Fore.RED}❌ Error: {archivo} tiene formato JSON inválido{Style.RESET_ALL}")
        return None


def imprimir_banner():
    """
    Imprime el banner de inicio del simulador
    """
    banner = f"""
     {Fore.CYAN}
     ╔══════════════════════════════════════════════════════════╗
     ║                                                          ║
     ║           🐄 CAMPORT IoT SIMULATOR 🐄                   ║
     ║                                                          ║
     ║        Sistema de Simulación de Collares IoT             ║
     ║           para Gestión Ganadera Inteligente              ║
     ║                                                          ║
     ╚══════════════════════════════════════════════════════════╝{Style.RESET_ALL}
         """
    print(banner)


def imprimir_configuracion(config):
    """
    Imprime la configuración cargada

    Args:
        config (dict): Configuración del simulador
    """
    print(f"\n{Fore.YELLOW}📋 CONFIGURACIÓN:{Style.RESET_ALL}")
    print(f"   Backend: {config['backend']['url']}")
    print(f"   Intervalo: {config['simulacion']['intervalo_envio']}s")
    print(f"   Collares activos: {len([c for c in config['collares'] if c['activo']])}")
    print(f"   Modo debug: {'✓' if config['simulacion']['modo_debug'] else '✗'}")


def log_info(mensaje):
    """
    Imprime un mensaje informativo

    Args:
        mensaje (str): Mensaje a imprimir
    """
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"{Fore.BLUE}[{timestamp}] ℹ {mensaje}{Style.RESET_ALL}")


def log_success(mensaje):
    """
    Imprime un mensaje de éxito

    Args:
        mensaje (str): Mensaje a imprimir
    """
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"{Fore.GREEN}[{timestamp}] ✓ {mensaje}{Style.RESET_ALL}")


def log_error(mensaje):
    """
    Imprime un mensaje de error

    Args:
        mensaje (str): Mensaje a imprimir
    """
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"{Fore.RED}[{timestamp}] ✗ {mensaje}{Style.RESET_ALL}")


def log_warning(mensaje):
    """
    Imprime un mensaje de advertencia

    Args:
        mensaje (str): Mensaje a imprimir
    """
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"{Fore.YELLOW}[{timestamp}] ⚠ {mensaje}{Style.RESET_ALL}")


def guardar_log_json(datos, archivo='telemetria_log.json'):
    """
    Guarda los datos de telemetría en un archivo JSON (opcional)

    Args:
        datos (dict): Datos a guardar
        archivo (str): Nombre del archivo
    """
    try:
        # Cargar datos existentes
        if os.path.exists(archivo):
            with open(archivo, 'r', encoding='utf-8') as f:
                log_data = json.load(f)
        else:
            log_data = []

        # Agregar nuevos datos
        log_data.append(datos)

        # Guardar (mantener solo últimos 1000 registros)
        with open(archivo, 'w', encoding='utf-8') as f:
            json.dump(log_data[-1000:], f, indent=2, ensure_ascii=False)

    except Exception as e:
        log_error(f"No se pudo guardar log: {e}")