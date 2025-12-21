# Gráficos de TradingView con Señales de Trading

## Descripción

Se ha implementado una funcionalidad completa para mostrar gráficos de TradingView directamente en la página de detalles de cada operación, con las señales de entrada y salida marcadas automáticamente con triángulos de colores.

## Características Principales

### 1. Integración Directa en Detalles de Operación
- El gráfico se muestra directamente en la página de detalles de la operación
- Se ubica debajo de la sección de imágenes adjuntas
- No requiere ventanas emergentes o modales adicionales

### 2. Señales Visuales Automáticas
- **Triángulo Verde (↑)**: Marca el punto de entrada de la operación
- **Triángulo Rojo (↓)**: Marca el punto de salida de la operación
- Las señales muestran el precio exacto y están bloqueadas para evitar modificaciones

### 3. Panel de Información
El gráfico incluye un panel superior que muestra:
- Precio y hora de entrada
- Precio y hora de salida
- P&L de la operación
- Duración total de la operación

### 4. Conversión Automática de Símbolos
El sistema convierte automáticamente los instrumentos a formato TradingView:

#### Forex
- EURUSD, GBPUSD, USDJPY, etc. → Símbolos directos

#### Índices
- NAS100 → NASDAQ:NDX
- SPX500 → CAPITALCOM:US500
- US30 → CAPITALCOM:US30
- GER40 → CAPITALCOM:GER40

#### Materias Primas
- GOLD/XAUUSD → CAPITALCOM:GOLD
- SILVER/XAGUSD → CAPITALCOM:SILVER
- OIL/CRUDE → CAPITALCOM:OIL

#### Criptomonedas
- BTCUSD/BTCUSDT → BINANCE:BTCUSDT
- ETHUSDT → BINANCE:ETHUSDT
- Cualquier *USDT → BINANCE:*USDT

## Cómo Usar

### Desde la Tabla de Operaciones
1. En la tabla de operaciones, cada fila tiene un botón azul con icono de gráfico (📈)
2. Hacer clic en este botón abrirá automáticamente la página de detalles y mostrará el gráfico

### Desde la Página de Detalles
1. Navegar a los detalles de una operación
2. En la sección "Gráfico de Trading", hacer clic en "Mostrar Gráfico"
3. El gráfico se cargará automáticamente con las señales marcadas
4. Usar "Ocultar" para cerrar el gráfico y liberar recursos

## Configuración del Gráfico

### Configuración Predeterminada
- **Tema**: Oscuro (para mejor integración visual)
- **Intervalo**: 5 minutos
- **Zona horaria**: UTC
- **Estudios**: Volumen incluido por defecto
- **Idioma**: Español

### Personalización
Los colores y estilos se pueden modificar en el código JavaScript:
```javascript
"overrides": {
    "paneProperties.background": "#1e1e1e",
    "paneProperties.vertGridProperties.color": "#2a2a2a",
    "paneProperties.horzGridProperties.color": "#2a2a2a"
}
```

## Manejo de Errores

### Símbolos No Encontrados
- Si un símbolo no existe en TradingView, se muestra un mensaje de error informativo
- El sistema intenta varias alternativas de formato antes de fallar

### Problemas de Conexión
- Se muestra un indicador de carga mientras se conecta a TradingView
- Timeout automático si la conexión falla

## Rendimiento y Optimización

### Carga Bajo Demanda
- Los gráficos solo se cargan cuando el usuario los solicita explícitamente
- Esto evita ralentizar la carga inicial de la página

### Limpieza Automática
- Los widgets se destruyen automáticamente al cambiar de página
- Esto libera memoria y evita conflictos

### Gestión de Recursos
- Solo se permite un gráfico activo a la vez
- Los recursos se liberan correctamente al ocultar el gráfico

## Archivos Modificados

### HTML/CSS
- Agregada sección de gráfico en la página de detalles de operación
- Estilos CSS para el contenedor del gráfico
- Botón adicional en la tabla de operaciones
- Ajustes de ancho de columnas en la tabla

### JavaScript
- Funciones de conversión de símbolos
- Creación y destrucción de widgets de TradingView
- Manejo de señales de trading
- Event listeners para botones de mostrar/ocultar

## Dependencias

### TradingView Charting Library
```html
<script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
```

Esta biblioteca se carga automáticamente desde el CDN de TradingView.

## Consideraciones Técnicas

### Compatibilidad
- Funciona en todos los navegadores modernos
- Requiere conexión a internet para cargar los gráficos
- Compatible con dispositivos móviles y de escritorio

### Privacidad
- Los datos de las operaciones se procesan localmente
- Solo se envían los símbolos de instrumentos a TradingView (no precios ni volúmenes)
- No se almacenan datos en servidores externos

### Limitaciones
- Depende de la disponibilidad de símbolos en TradingView
- Algunos instrumentos específicos de brokers podrían no estar disponibles
- La precisión de las señales depende de que las horas de entrada/salida sean correctas

## Futuras Mejoras Posibles

1. **Intervalos Personalizables**: Permitir al usuario cambiar el timeframe del gráfico
2. **Más Estudios Técnicos**: Agregar indicadores adicionales automáticamente
3. **Análisis de Performance**: Mostrar estadísticas adicionales en el gráfico
4. **Exportación**: Permitir guardar capturas del gráfico con las señales
5. **Múltiples Timeframes**: Mostrar varios gráficos con diferentes intervalos