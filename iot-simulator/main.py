"""
     Simulador IoT - Proyecto Camport
     Punto de entrada principal del simulador de collares inteligentes
     """

import time
import sys
from collar_simulator import CollarSimulator
from api_client import APIClient
from utils import (
    cargar_configuracion,
    imprimir_banner,
    imprimir_configuracion,
    log_info,
    log_success,
    log_error,
    log_warning,
    guardar_log_json
)
from colorama import Fore, Style


class SimuladorCamport:
    """
    Clase principal que orquesta la simulación de múltiples collares
    """

    def __init__(self):
        """
        Inicializa el simulador completo
        """
        # Cargar configuración
        self.config = cargar_configuracion()
        if not self.config:
            sys.exit(1)

        # Extraer configuraciones
        self.backend_config = self.config['backend']
        self.sim_config = self.config['simulacion']
        self.potrero_coords = self.config['potrero']['coordenadas']
        self.parametros = self.config['parametros']

        # Inicializar cliente API
        self.api_client = APIClient(self.backend_config)

        # Crear simuladores de collares
        self.collares = []
        for collar_config in self.config['collares']:
            if collar_config['activo']:
                collar = CollarSimulator(collar_config, self.parametros)
                self.collares.append(collar)

        # Contadores
        self.ciclos = 0
        self.envios_exitosos = 0
        self.envios_fallidos = 0

        print(f"\n✅ {len(self.collares)} collares activos listos para simular\n")


    def verificar_backend(self):
        """
        Verifica que el backend esté disponible antes de iniciar

        Returns:
            bool: True si está disponible, False si no
        """
        log_info("Verificando conexión con el backend...")

        if self.api_client.verificar_conexion():
            log_success(f"Backend disponible en {self.backend_config['url']}")
            return True
        else:
            log_error(f"Backend NO disponible en {self.backend_config['url']}")
            log_warning("Asegúrate de que el servidor esté ejecutándose")
            return False


    def ejecutar_ciclo(self):
        """
        Ejecuta un ciclo completo de simulación:
        1. Actualizar sensores de todos los collares
        2. Generar telemetría
        3. Enviar al backend
        """
        self.ciclos += 1

        print(f"\n{Fore.CYAN}{'='*60}")
        print(f"  CICLO #{self.ciclos} - {time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*60}{Style.RESET_ALL}\n")

        for collar in self.collares:
            # 1. Actualizar todos los sensores del collar
            collar.actualizar_todo(self.potrero_coords)

            # 2. Generar payload de telemetría
            telemetria = collar.generar_telemetria()

            # 3. Mostrar estado en consola (modo debug)
            if self.sim_config['modo_debug']:
                print(f"📡 {collar.get_estado()}")

            # 4. Enviar al backend
            success, response = self.api_client.enviar_telemetria(telemetria)

            # 5. Mostrar resultado
            self.api_client.imprimir_resultado(collar.id, success, response)

            # 6. Actualizar contadores
            if success:
                self.envios_exitosos += 1
            else:
                self.envios_fallidos += 1

            # 7. Guardar log local (opcional)
            # guardar_log_json(telemetria)

        # Mostrar resumen del ciclo
        self._mostrar_resumen_ciclo()


    def _mostrar_resumen_ciclo(self):
        """
        Muestra un resumen del ciclo actual
        """
        print(f"\n{Fore.YELLOW}📊 Resumen del ciclo:{Style.RESET_ALL}")
        print(f"   ✓ Exitosos: {self.envios_exitosos}")
        print(f"   ✗ Fallidos: {self.envios_fallidos}")

        # Alertas si algún collar tiene batería baja
        for collar in self.collares:
            if collar.bateria < 20:
                log_warning(f"{collar.id}: Batería baja ({collar.bateria:.1f}%)")
            if collar.temperatura > 39.5:
                log_warning(f"{collar.id}: Temperatura elevada ({collar.temperatura:.1f}°C)")


    def ejecutar(self):
        """
        Loop principal del simulador
        """
        imprimir_banner()
        imprimir_configuracion(self.config)

        # Verificar backend
        if not self.verificar_backend():
            respuesta = input("\n¿Deseas continuar sin conexión? (s/n): ")
            if respuesta.lower() != 's':
                log_info("Simulador cancelado por el usuario")
                return

        print(f"\n{Fore.GREEN}🚀 Iniciando simulación...{Style.RESET_ALL}")
        print(f"⏱️  Intervalo de envío: {self.sim_config['intervalo_envio']} segundos")
        print(f"⌨️  Presiona Ctrl+C para detener\n")

        tiempo_inicio = time.time()
        duracion_total = self.sim_config['duracion_total']

        try:
            while True:
                # Ejecutar ciclo de simulación
                self.ejecutar_ciclo()

                # Verificar si llegamos al tiempo límite
                if duracion_total > 0:
                    tiempo_transcurrido = time.time() - tiempo_inicio
                    if tiempo_transcurrido >= duracion_total:
                        log_info(f"Tiempo límite alcanzado ({duracion_total}s)")
                        break

                # Esperar intervalo antes del siguiente ciclo
                time.sleep(self.sim_config['intervalo_envio'])

        except KeyboardInterrupt:
            print(f"\n\n{Fore.YELLOW}⏸️  Simulación detenida por el usuario{Style.RESET_ALL}")

        finally:
            self._mostrar_resumen_final()


    def _mostrar_resumen_final(self):
        """
        Muestra el resumen final de la simulación
        """
        print(f"\n{Fore.CYAN}{'='*60}")
        print(f"  📊 RESUMEN FINAL DE LA SIMULACIÓN")
        print(f"{'='*60}{Style.RESET_ALL}\n")

        print(f"   Ciclos ejecutados: {self.ciclos}")
        print(f"   Total de envíos: {self.envios_exitosos + self.envios_fallidos}")
        print(f"   ✓ Exitosos: {self.envios_exitosos}")
        print(f"   ✗ Fallidos: {self.envios_fallidos}")

        if self.envios_exitosos + self.envios_fallidos > 0:
            tasa_exito = (self.envios_exitosos / (self.envios_exitosos + self.envios_fallidos)) * 100
            print(f"   📈 Tasa de éxito: {tasa_exito:.1f}%")

        print(f"\n{Fore.CYAN}{'='*60}{Style.RESET_ALL}\n")

        # Estado final de cada collar
        print(f"{Fore.YELLOW}🐄 Estado final de los collares:{Style.RESET_ALL}\n")
        for collar in self.collares:
            print(f"   {collar.get_estado()}")

        print(f"\n{Fore.GREEN}✅ Simulación finalizada correctamente{Style.RESET_ALL}\n")


def main():
    """
    Función principal de entrada
    """
    try:
        simulador = SimuladorCamport()
        simulador.ejecutar()
    except Exception as e:
        log_error(f"Error fatal: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()