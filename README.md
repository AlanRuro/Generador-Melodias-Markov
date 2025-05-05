# Notas de Markov 

## Midi to matrix
Este programa procesa archivos MIDI para generar una matriz de transición que muestra la probabilidad de que una nota musical sea seguida por otra. La matriz se enfoca en las notas básicas (DO, RE, MI, FA, SOL, LA, SI) en la octava 4, permitiendo analizar patrones melódicos en piezas musicales.

## Funcionalidad

- Analiza archivos MIDI para identificar secuencias de notas
- Calcula probabilidades de transición entre notas básicas
- Genera una matriz de transición en formato JSON
- Excluye pistas de percusión para concentrarse solo en contenido melódico/armónico

## Requisitos

- Python 3.x
- Biblioteca `pretty_midi`

## Instalación

```bash
pip install pretty_midi
```

## Uso

```bash
python midi_to_matrix.py <ruta_al_archivo_midi>
```

El programa generará un archivo JSON con el mismo nombre que el archivo MIDI de entrada en el directorio `transition_matrices/`.
`ruta_al_archivo_midi` espera este formato: `melody/<nombre_del_archivo>`.

En la carpeta `melody` se encuentran los archivos MIDI utilizados para obtener las matrices de transicion, las cuales se encuentran en la carpeta `transition_matrices`.

## Estructura de salida

El archivo JSON de salida contiene un diccionario donde:
- Las claves son las notas de origen (DO, RE, MI, FA, SOL, LA, SI)
- Los valores son diccionarios que mapean las notas de destino con sus probabilidades

Ejemplo:
```json
{
  "DO": {
    "DO": 0.2,
    "RE": 0.3,
    "MI": 0.1,
    "FA": 0.1,
    "SOL": 0.1,
    "LA": 0.1,
    "SI": 0.1
  },
  "RE": {
    "DO": 0.1,
    "RE": 0.2,
    ...
  },
  ...
}
```

## Detalles de implementación

- `get_note_name()`: Convierte un valor MIDI numérico a notación latina (DO, RE, MI...)
- `generate_transition_matrix()`: Procesa el archivo MIDI y calcula las probabilidades de transición
- `main()`: Maneja la entrada/salida y el flujo principal del programa

## Uso

Si usa VS Code, corra el archivo `app.js` con Live Server para la actualizacion de las matrices. Puede seleccionar la cancion de base para generar la melodia, asi como la cantidad de notas.

## Reflexion

### Patrones
Las cadenas de Markov de primer orden solo recuerdan el estado anterior. La música tiene patrones más largos (como motivos rítmicos y melódicos).

Para capturar estilo, podríamos usar las últimas 2, 3 o más notas para determinar la transición (segundo, tercer orden, etc.). Esto permitiría capturar secuencias o motivos musicales más complejos.

Tambien, podríamos implementar diferentes matrices para distintas secciones de una pieza, cambiando entre ellas para crear estructura musical reconocible.

### Aprendizaje 

Un modelo de Markov podría aprender aspectos de un estilo musical:

Analizando múltiples piezas de un mismo compositor o género, podríamos generar matrices que reflejen sus tendencias de estilo.

### Limitaciones

A pesar de su utilidad, los modelos markovianos presentan limitaciones significativas:

- Ausencia de estructura global: Las cadenas de Markov carecen de "memoria" a largo plazo, dificultando la generación de formas musicales coherentes.
- Dimensiones musicales limitadas: El modelo presentado solo considera la altura de las notas, pero la música involucra también ritmo, dinámica, timbre y articulación.
- Originalidad vs. imitación: Un modelo entrenado estrictamente con piezas existentes puede reproducir patrones pero difícilmente innovar de manera significativa.
- Falta de contexto: Al no tener "conciencia" sobre la parte de la melodia en que se encuentra, puede resultar en una melodia sin direccion.
- Solo analiza notas en la octava 4
- No considera la duración de las notas, solo sus transiciones
- Las notas con alteraciones (#) son ignoradas en la matriz final