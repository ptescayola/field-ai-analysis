# AI Agronomic Copilot

> Tiempo estimado de lectura: 5 minutos

## Motivación

He desarrollado este proyecto como un ejercicio de exploración y puesta en
práctica de conocimientos sobre sistemas basados en agentes de OpenAI. La idea
está inspirada en el objetivo de RawData: aplicar datos y tecnología a
necesidades reales del sector agroalimentario.

El *agritech* me parece un ámbito especialmente interesante por la cantidad de
aplicaciones y automatizaciones que puede aportar a la gestión de las
explotaciones agrícolas. En España, la agricultura tiene un peso económico,
social y territorial importante, y las empresas dedicadas a digitalizar el
sector pueden contribuir de forma relevante a su evolución.

Mantener una producción eficiente y cumplir las exigencias del mercado resulta
cada vez más costoso. El precio de los recursos, la disponibilidad de agua, los
eventos climáticos y la necesidad de asegurar la calidad hacen que la toma de
decisiones sea más compleja. Entender bien estas necesidades permite aplicar la
tecnología con un propósito concreto: optimizar recursos, automatizar tareas
repetitivas y facilitar decisiones basadas en datos.

## Caso de uso

### Alcance

El sector agrícola tiene una complejidad que requiere conocimiento
especializado. No soy experto en agronomía, por lo que este proyecto debe
entenderse como una prueba de concepto técnica, no como una herramienta
preparada para tomar decisiones reales sobre una explotación. El objetivo es
demostrar una forma de organizar, validar y coordinar agentes alrededor de un
caso de uso concreto.

La aplicación recibe como entrada un archivo JSON que representa el estado de
una parcela. Incluye datos que podrían proceder de sensores instalados sobre el
terreno:

- cultivo, variedad y etapa de crecimiento;
- tipo, humedad, temperatura y pH del suelo;
- temperatura, humedad ambiental y precipitaciones;
- índice de vegetación NDVI;
- observaciones realizadas por el agricultor.

La información del archivo se complementa con una previsión meteorológica de
siete días obtenida mediante Open-Meteo. De este modo, el análisis combina el
estado registrado de la parcela con información meteorológica actualizada.

En una evolución futura, parte de estos datos también podría extraerse a partir
de imágenes capturadas por cámaras, drones u otros dispositivos. Mediante
modelos de visión artificial se podrían detectar indicadores como estrés
hídrico, cambios en el color de las hojas, presencia de plagas o irregularidades
en el crecimiento. Esta capacidad no forma parte de la implementación actual,
pero podría incorporarse como una fuente de datos adicional.

El análisis responde a una pregunta concreta:

> ¿Es necesario regar esta parcela durante las próximas 48 horas?

Como resultado, la aplicación muestra:

- una recomendación de riego;
- un resumen del estado de la parcela;
- los principales riesgos detectados;
- recomendaciones agronómicas;
- una explicación y un nivel de confianza.

En una integración más sencilla, la decisión también podría exponerse como un
valor booleano para alimentar un sistema de automatización. En un entorno real,
la activación del riego requeriría reglas de seguridad, validaciones adicionales
y supervisión profesional.

## Sistema de agentes

El análisis se divide entre cuatro agentes con responsabilidades específicas:

### Data Analyst

Interpreta los datos de entrada e identifica observaciones relevantes, como
niveles bajos de humedad, cambios en el NDVI o ausencia de precipitaciones.
Su función es convertir las mediciones en información comprensible para el
resto del sistema.

### Risk Analyst

Evalúa posibles riesgos para la parcela, por ejemplo estrés hídrico,
enfermedades, plagas o condiciones meteorológicas adversas. Para cada riesgo
aporta evidencias, severidad y confianza.

### Agronomist

Combina los datos de la parcela con las observaciones del Data Analyst y los
interpreta desde una perspectiva agronómica. Valora el desarrollo del cultivo,
la salud de las plantas y la necesidad de riego.

### Coordinator

Recibe las conclusiones de los agentes anteriores, resuelve posibles
discrepancias y construye una respuesta final coherente. Es responsable de
presentar el resumen, los riesgos y la recomendación principal.

El Data Analyst y el Risk Analyst se ejecutan en paralelo porque sus tareas son
independientes. Después interviene el Agronomist y, finalmente, el Coordinator
sintetiza todos los resultados.

En esta prueba de concepto, los agentes trabajan con un contexto y unos
prompts deliberadamente acotados. En una evolución futura podrían alcanzar un
nivel de especialización mucho mayor si se respaldan con fuentes profesionales:
históricos de sensores, datos de suelo, imágenes por satélite, modelos de
plagas, documentación agronómica y protocolos validados por especialistas.
También podrían especializarse por cultivo, zona geográfica o tipo de
explotación. De esta forma, sus conclusiones estarían mejor fundamentadas y
serían más útiles para apoyar decisiones reales. La separación actual entre
agentes, prompts y fuentes de datos facilita incorporar estas capacidades de
forma progresiva.

## Parte técnica

### Stack

- **Frontend:** Vue 3, Vite y TypeScript.
- **Backend:** Node.js, TypeScript y Hono para el servidor local.
- **Inteligencia artificial:** OpenAI con respuestas estructuradas.
- **Validación:** Zod para comprobar datos de entrada y respuestas de agentes.
- **Meteorología:** API de Open-Meteo.
- **Despliegue:** Vercel, con frontend estático y funciones serverless.
- **Calidad:** pruebas unitarias con el test runner de Node.js y CI mediante
  GitHub Actions.

### Arquitectura

El backend sigue una arquitectura hexagonal organizada en cuatro capas:

- **Domain:** contratos, esquemas y puertos independientes de la tecnología.
- **Application:** casos de uso y coordinación del pipeline de agentes.
- **Infrastructure:** adaptadores para OpenAI, Open-Meteo y persistencia JSON.
- **Presentation:** API HTTP, funciones de Vercel y aplicación de consola.

Las dependencias se conectan en un único *composition root*. Los casos de uso
dependen de interfaces y no de implementaciones concretas, lo que facilita
sustituir servicios externos y probar el núcleo de la aplicación mediante
adaptadores simulados.

### Decisiones técnicas

- Los prompts de los agentes están separados del código y versionados.
- Las respuestas del modelo se validan con esquemas antes de entrar en el
  pipeline.
- Los agentes independientes se ejecutan en paralelo para reducir la latencia.
- La información meteorológica dispone de una alternativa basada en el
  *snapshot* del campo si el servicio externo falla.
- La API pública no devuelve las trazas internas completas de los agentes.
- La clave de OpenAI permanece exclusivamente en el backend mediante variables
  de entorno.
- Los datos de ejemplo representan parcelas de Galicia, Ibiza, Catalunya y
  Andalucía con condiciones agrícolas diferentes.

## Conclusión

Esta prueba de concepto me ha permitido trabajar de forma práctica con el
diseño y la coordinación de agentes, las respuestas estructuradas, la
integración de servicios externos y la separación de responsabilidades mediante
una arquitectura hexagonal.

El alcance es intencionadamente reducido, pero permite mostrar cómo distintas
fuentes de información pueden combinarse para construir una respuesta
comprensible y explicable alrededor de una necesidad concreta. El valor del
sistema no está únicamente en generar una recomendación, sino en presentar las
observaciones, los riesgos y el razonamiento que conducen hasta ella.

Como siguiente paso, el proyecto podría evolucionar incorporando fuentes de
datos profesionales, agentes más especializados y validación por parte de
expertos del sector. La base técnica se ha planteado para que estas mejoras
puedan añadirse sin tener que modificar por completo el núcleo de la
aplicación.

## Autor y dedicación

- **Autor:** Pere Torres Escayola
- **Email:** [ptescayola@gmail.com](mailto:ptescayola@gmail.com)
- **LinkedIn:** [linkedin.com/in/pere-torres](https://www.linkedin.com/in/pere-torres/)
- **Tiempo invertido:** aproximadamente 3 horas

