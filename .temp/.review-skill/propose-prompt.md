/openspec-propose

Quiero construir un skill para agentes llamado `architecture-review` (si el nombre no encaja, propón otro).

## Qué hace

Es un universo cerrado de representación, análogo a `show-me`. Lo apunto a cualquier cosa: código existente (a menudo vibe-codeado), un endpoint, un caso de uso o un flujo que me estoy imaginando. Me devuelve un paquete de diseño en pseudocódigo para que yo, como arquitecto, entienda la estructura de un vistazo:

- casos de uso separados en comandos y queries;
- un repositorio por contexto;
- dominio mínimo;
- DTOs entre contextos;
- sagas en Mermaid y una vista de secuencia.

La entrada típica es «dime cómo está hecha por dentro esta herramienta». Después iteramos sobre qué mejorar, siempre con las mismas reglas. Sirve para comprender: muestra solo el flujo pedido y su happy path, y es fiel al código. No implementa nada y no depende de OpenSpec.

## Material que traigo (léelo antes de planificar)

- `.review-skill/features/*.feature.md` — 7 Features en Gherkin (`@ai`): son el **contrato de aceptación**. Sirven para verificar y para escribir evals. **No los copies dentro del skill.**
- `.review-skill/dissonances.md` — decisiones abiertas y resueltas. Las abiertas no se resuelven en silencio.
- `.review-skill/handoff.md` — marco de lectura: el porqué de las reglas.
- `.review/` — paquete de ejemplo (proceso de grabación de capture-context). Úsalo como fixture de referencia.
- `.review-openspec/` — segundo paquete de ejemplo (el propio flujo de OpenSpec, con su bucle fractal). Segundo fixture.

## Cómo quiero el skill (lo más importante)

- **Artesanía, no acumulación.** Quiero un SKILL.md corto, basado en principios fundamentales que le den al modelo un marco para pensar, apoyándose en lo que ya sabe (Clean Architecture, CQS, sagas, Step Functions, DDD). Nada de un parche por cada caso que salió en la conversación: si una regla es consecuencia de un principio, enuncia el principio.
- **Referencias solo si se las ganan.** Como mucho, una plantilla o un ejemplo mínimo de la notación Mermaid, si sin ella el modelo falla.
- **Guías de estilo:**
  - el skill `writing-for-agents`;
  - los repositorios https://github.com/humanlayer/skills y https://github.com/mattpocock/skills (léelos y copia su tono y su economía, no su contenido);
  - el `skill-creator` para la mecánica y las evals, vigilando que no infle el skill.
- El skill se escribe **en inglés**. Los paquetes que genera, también.

## Principios que el skill tiene que transmitir (el detalle está en los Features)

1. **Universo cerrado:** siempre las mismas reglas de representación; fiel al código; solo el flujo pedido y su happy path, pensando como en un MVP.
2. **Capas:** el dominio es síncrono y no conoce repositorios. Los casos de uso orquestan dominio y repositorio dentro de un contexto, sin condicionales. Las sagas coordinan casos de uso entre contextos.
3. **Corte saga / caso de uso:** «si muere aquí, ¿me da igual repetir lo anterior?». El progreso durable es el estado serializado de la saga. Un caso de uso nunca llama a otro.
4. **Localidad:** cada decisión va donde está la información para tomarla. Reintento de transporte → repositorio; reintento del paso → saga; alternativa → `catch`. Optimización: la que viene de una herramienta va al repositorio; la que cambia el *cuándo*, a la saga; la que cambia el resultado, al dominio.
5. **Sin filtración de infraestructura:** todo lo externo al lenguaje (BD, FFmpeg, APIs, modelos, personas) va detrás de un repositorio por contexto. Una regla que debe cumplirse con cualquier modelo es un método de verificación del objeto de dominio, nunca un objeto de reglas ni un prompt escondido.
6. **Visibilidad:** un caso de uso recibe como argumento todo lo que usa, aunque sea una lectura barata.
7. **Comando / query** por esencia: carpetas `commands/` y `queries/`; en la saga, azul y verde.
8. **Diagramas con vocabulario cerrado:** paso, sub-saga, parallel, map, catch (solo si se pide) y entrada/salida. Sin `choice`, sin `wait`, sin eventos. Además, una secuencia en la raíz con los contextos como carriles.

## Decisiones ya tomadas (no las vuelvas a preguntar)

- **Estructura:** `<context>/application/{commands,queries}/*.use-case.ts`, `<context>/application/<context>.repository.ts`, `<context>/domain/*.ts` (un objeto por archivo, sin sufijo), `<context>/<saga>.saga.md` en la raíz del contexto, `shared/dtos.ts` (solo alias, sin comentarios) y `<main-saga>.sequence.md` en la raíz del paquete.
- **Nombres:**
  - archivos en kebab-case con el rol detrás de un punto;
  - tipos con sufijo (`UseCase`, `Repository`, `Saga`, `DTO`), menos los de dominio;
  - nodos de la saga con el nombre del paso, sin sufijo.
- **Mermaid:**
  - comandos: `fill:#4C8DF626,stroke:#4C8DF6,stroke-width:2px`; queries: `#009E7326` / `#009E73`; leyenda «Blue = command · Green = query»;
  - los nodos enlazan a su archivo con `state "<a href='…'>Name</a>" as Id`;
  - la sub-saga y los contenedores van neutros;
  - en la secuencia, carriles con caja de color (tinte translúcido y borde) mediante `themeCSS`: primero el activador, luego la saga y después los contextos; las sub-sagas, como `rect` gris con una `Note`.
- **Oportunidades de infraestructura:** un comentario `// Opportunity: …` encima del método del repositorio, como mucho 3 por paquete.
- **Sin** README, valores de configuración ni políticas inventadas.

## Lo que espero del change

- **Alcance:** el SKILL.md (más alguna referencia mínima, solo si se la gana) y evals derivadas de los Features que se ejecuten sobre los dos fixtures, más un caso nuevo: un repositorio pequeño cualquiera al que se le pregunte «¿cómo está hecho este flujo?».
- **Decisiones abiertas:** las de `dissonances.md` que afecten al alcance, pregúntamelas de una en una, con tu recomendación primero.
