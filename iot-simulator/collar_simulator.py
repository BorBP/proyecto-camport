"""
Simulador de Collar Inteligente
Simula el comportamiento de un collar IoT para ganado bovino
"""

import random
import time
from datetime import datetime
import math


class CollarSimulator:
    """
    Simula un collar IoT con sensores de GPS, batería, temperatura y actividad
    """
    def __init__(self, config, parametros):
        """
        Inicializa el simulador de collar

        Args:
            config (dict): Configuración del collar específico
            parametros (dict): Parámetros generales de simulación
        """
        self.id = config['id']
        self.animal = config['animal']
        self.activo = config['activo']

        # Posición actual
        self.latitud = config['posicion_inicial']['latitud']
        self.longitud = config['posicion_inicial']['longitud']
        self.altitud = config['posicion_inicial']['altitud']

        # Sensores
        self.bateria = config['bateria_inicial']
        self.temperatura_base = config['temperatura_base']
        self.temperatura = self.temperatura_base
        self.actividad = random.randint(40, 70)

        # Parámetros de movimiento
        self.velocidad = parametros['velocidad_movimiento']
        self.descarga_bateria = parametros['descarga_bateria']
        self.variacion_temp = parametros['variacion_temperatura']
        self.actividad_min = parametros['actividad_minima']
        self.actividad_max = parametros['actividad_maxima']

        # Estado interno
        self.direccion = random.uniform(0, 2 * math.pi)  # Dirección en radianes
        self.precision_gps = random.uniform(3, 8)  # Precisión GPS en metros

        print(f"✅ Collar {self.id} inicializado para {self.animal}")


    def actualizar_posicion(self, potrero_coords):
        """
        Actualiza la posición del animal con movimiento aleatorio dentro del potrero

        Args:
            potrero_coords (list): Lista de coordenadas del polígono del potrero
        """
        # Cambiar dirección aleatoriamente (comportamiento de pastoreo)
        if random.random() < 0.3:  # 30% de probabilidad de cambiar dirección
            self.direccion += random.uniform(-math.pi/4, math.pi/4)

        # Calcular nuevo desplazamiento
        delta_lat = self.velocidad * math.cos(self.direccion)
        delta_lng = self.velocidad * math.sin(self.direccion)

        # Proponer nueva posición
        nueva_lat = self.latitud + delta_lat
        nueva_lng = self.longitud + delta_lng

        # Verificar si está dentro del potrero (simplificado)
        # En producción real usarías un algoritmo de punto-en-polígono más robusto
        if self._punto_en_potrero(nueva_lat, nueva_lng, potrero_coords):
            self.latitud = nueva_lat
            self.longitud = nueva_lng
            # Variación leve en altitud
            self.altitud += random.uniform(-0.5, 0.5)
        else:
            # Si sale del potrero, cambiar dirección opuesta
            self.direccion += math.pi

        # Actualizar precisión GPS (varía naturalmente)
        self.precision_gps = random.uniform(3, 8)


    def _punto_en_potrero(self, lat, lng, coords):
        """
        Verifica si un punto está dentro del polígono del potrero
        Usa el algoritmo ray casting simplificado

        Args:
            lat (float): Latitud del punto
            lng (float): Longitud del punto
            coords (list): Lista de coordenadas del polígono

        Returns:
            bool: True si está dentro, False si está fuera
        """
        # Algoritmo Ray Casting
        inside = False
        n = len(coords)

        for i in range(n):
            j = (i + 1) % n

            lat_i = coords[i]['lat']
            lng_i = coords[i]['lng']
            lat_j = coords[j]['lat']
            lng_j = coords[j]['lng']

            if ((lng_i > lng) != (lng_j > lng)) and \
                (lat < (lat_j - lat_i) * (lng - lng_i) / (lng_j - lng_i) + lat_i):
                inside = not inside

        return inside


    def actualizar_bateria(self):
        """
        Simula el consumo de batería del collar
        """
        # Descarga normal
        self.bateria -= self.descarga_bateria

        # Consumo adicional si hay mucha actividad
        if self.actividad > 70:
            self.bateria -= self.descarga_bateria * 0.5

        # No puede ser negativa
        self.bateria = max(0, self.bateria)


    def actualizar_temperatura(self):
        """
        Simula la temperatura corporal del animal
        """
        # Temperatura normal: 38-39°C para bovinos
        # Variación natural durante el día
        variacion = random.uniform(-self.variacion_temp, self.variacion_temp)
        self.temperatura = self.temperatura_base + variacion

        # Temperatura aumenta con actividad alta
        if self.actividad > 75:
            self.temperatura += random.uniform(0, 0.5)

        # Limitar rango (37.5 - 40°C es normal, más es fiebre)
        self.temperatura = max(37.5, min(40.5, self.temperatura))


    def actualizar_actividad(self):
        """
        Simula el nivel de actividad del animal (0-100)
        """
        # Cambio aleatorio en actividad
        cambio = random.uniform(-15, 15)
        self.actividad += cambio

        # Mantener dentro del rango
        self.actividad = max(self.actividad_min,
                            min(self.actividad_max, self.actividad))

        # Redondear
        self.actividad = round(self.actividad)


    def generar_telemetria(self):
        """
        Genera el payload JSON de telemetría para enviar al backend

        Returns:
            dict: Datos de telemetría en formato JSON
        """
        return {
            "collar_id": self.id,
            "latitud": round(self.latitud, 6),
            "longitud": round(self.longitud, 6),
            "altitud": round(self.altitud, 1),
            "precision": round(self.precision_gps, 2),
            "bateria": round(self.bateria, 2),
            "temperatura": round(self.temperatura, 2),
            "actividad": int(self.actividad),
            "timestamp": datetime.utcnow().isoformat() + "Z"
            }


    def actualizar_todo(self, potrero_coords):
        """
        Actualiza todos los sensores del collar

        Args:
            potrero_coords (list): Coordenadas del potrero
        """
        self.actualizar_posicion(potrero_coords)
        self.actualizar_bateria()
        self.actualizar_temperatura()
        self.actualizar_actividad()


    def get_estado(self):
        """
        Obtiene el estado actual del collar para logging

        Returns:
            str: String con el estado actual
        """
        return (f"{self.id} ({self.animal}): "
                f"Pos[{self.latitud:.4f}, {self.longitud:.4f}] "
                f"Bat:{self.bateria:.1f}% "
                f"Temp:{self.temperatura:.1f}°C "
                f"Act:{self.actividad}")