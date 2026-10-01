# Disonancias y decisiones abiertas

Fuentes: sesión de Codex (CX) y sesión de Claude (CL) del 2026-09-30, y el `.review/` actual.
Cada punto abierto aparece también en la descripción del Feature al que afecta.

## Reglas en tensión

| # | Tensión | Citas | Decisión abierta |
|---|---|---|---|
| 1 | Solo happy path ↔ retry/catch en la saga | «siempre modelarán el happy path» (CX) · «la saga… tiene la lógica de reintentos y del catch» (CX) | El catch que desvía ya está aceptado (plantilla ante resumen inválido). Falta decidir: ¿la arista del catch cuenta contra la «única rama troncal»? |
| 2 | «3 sagas» | «deberían considerarse como 3 sagas… mas los pasos previos antes de la bifurcación» (CX) | ¿El tramo antes de la bifurcación es una saga propia + 2 ramas, o cada variante repite el tramo común? ¿Cómo se dibuja el `choice`? (la tabla de rutas se descartó: «nos hemos ido demasiado para las ramas») |
| 3 | `choice` como primitiva ↔ una sola rama troncal | «La saga tiene batch, parallel, choices…» (CX) | ¿Se permite `choice` dentro de un diagrama, solo para elegir sub-sagas, o nunca? |
| 4 | `Promise.all` en casos de uso | «puedes representar paralelismo con un promisor» (CX) ↔ se quitó el de Prem por ser infraestructura (CL) | ¿Cuándo es de dominio el paralelismo dentro de un caso de uso? `AudioFragment` **resuelto**: eliminado, `transcribeNarration(session)` en el repositorio |
| 5 | Comprensión ↔ sistema real | «tratando con la comprensión, no con el sistema real» (CX) ↔ la sub-saga se justificó con los puntos de guardado reales del daemon (CL) | **Resuelta:** «dime cómo está» es representación fiel del código, recortando lo que no cambia el resultado; las iteraciones posteriores rediseñan con las mismas reglas. Pendiente: si una incoherencia del código se normaliza o se marca, y si se distingue lo actual de lo propuesto |
| 6 | Punto de guardado = paso de saga | regla aceptada (CL) ↔ `PrepareImages`, `PrepareNarration` y `SummarizeSession` no guardan nada | **Resuelta:** el progreso durable es el estado serializado de la saga (la salida de cada paso). Un caso de uso que no guarda nada es un paso válido. Se quitó `saveFrameSelection` del `.review` |
| 7 | `shared/` = un archivo de DTOs | «un archivo de DTOs… no complicarnos con tantos archivos» (CL) ↔ `shared/` tiene `DTOs.ts`, `Session.ts` y `Primitives.ts` | **Resuelta:** `shared/` es solo `DTOs.ts`, con alias directos a tipos de dominio, sin `Pick`/`Omit`. `Session` vive en `evidence/domain` y se expone como `SessionDTO`. Las primitivas se sustituyen por `number`/`string` y `TimeRange` pasa a dominio de Evidencia |
| 8 | Sufijos | «siempre el sufijo atrás» (CL): tipos | Etiquetas de nodos **resuelto**: nombre del paso sin sufijo, con enlace al archivo. Variables y parámetros: extensión de la IA, sin confirmar. Los estados compuestos (`PrepareEvidence`, `ProcessChapters`) no tienen convención |
| 9 | Contexto de la saga | «tiene que caber en algún contexto» (CL) | El criterio «el contexto dueño de su resultado» lo propuso la IA; no está confirmado |
| 10 | Un repositorio por contexto ↔ «interfaces simples y profundas» | ambas del usuario (CL) | `ChapterRepository` tiene 9 métodos: ¿cuándo deja de ser simple? ¿Hay excepciones a «uno por contexto»? |
| 11 | Sin filtración de infraestructura ↔ nombres de herramientas en comentarios | «score grid es un code smell de infraestructura» (CL) | Las cabeceras de los repositorios mencionan SQLite, FFmpeg, Prem y OpenAI: ¿se permite? |
| 12 | Notación de tiempos | t-ch, leyenda y porcentajes los pidió el usuario (CX) | Desapareció del `.review` sin decisión: ¿vive en el paquete o solo en respuestas? |
| 13 | Entradas/salidas visibles | el árbol ShowMe mostraba `-> images`, `-> timeline` (CX) | Mermaid las perdió: ¿las transiciones deben mostrar los datos? |
| 14 | Lugar en OpenSpec | «sería una de las fases de la preparación» (CL) | ¿Qué artefacto, qué carpeta y qué ciclo de vida (por change, se archiva)? |
| 15 | Event-driven | `Session` en shared «por ahora que no estamos usando event driven» (CL) | ¿Qué reglas cambian con eventos? |
| 16 | «Haz evidente lo que obviamente hace falta» ↔ «solo si hace falta» | «que las vuelvas evidentes en la saga» (CX) · «si el usuario lo pide o si se cree que se necesita» (CX) | ¿Quién decide que hace falta un batch, un buffer, un límite de ritmo o concurrencia sin que se pida? (retry y catch ya tienen regla) |
| 17 | Mapeo entidad → DTO | reglas de DTO (CL) | ¿Quién convierte `Timeline` en `TimelineDTO`, y se ve en la saga o en un caso de uso? ¿Un tipo de dominio anidado en un DTO tiene que ser también DTO? |
| 18 | `shared` depende de los contextos | «Share… puede depender de contexto» (CL) | Consecuencia: el dominio de Capítulos depende de forma transitiva del de Evidencia. ¿Es aceptable? |
| 19 | Comprobar tipos | la IA ejecutó `tsc` en cada cambio; nadie lo pidió | ¿El pseudocódigo tiene que compilar? |
| 20 | Exploración progresiva | flujo → worked example → zoom → pseudocódigo (CX) | ¿Forma parte de este skill o de uno previo? (en la spec va como Feature aparte) |
| 21 | Dentro de cada contexto solo `application/` y `domain/` | «las carpetas que hay son application y domain» (CL) | **Resuelta:** la saga va suelta en la raíz del contexto, junto a `application/` y `domain/`, como punto de entrada |
| 22 | La memoria de la IA como fuente | la nota de memoria mezcla propuestas de la IA con reglas del usuario | Tratarla como resumen de la IA, no como fuente |

## Incumplimientos del `.review` actual frente a las reglas finales

1. ~~`PrepareImages`, `PrepareNarration` y `SummarizeSession` no guardan nada~~: resuelto por la fila 6.
2. ~~`PrepareNarration` mantiene `Promise.all` sobre `AudioFragment`~~: resuelto.
3. Evidencia y Capítulos extraen imágenes los dos. Además, Capítulos devuelve `ImageDTO`, declarado como «Evidencia → Capítulos», para datos que produce él mismo.
4. `ProcessedChapterDTO` expone a Publicación `Chapter` y `ChapterSummary`, que son tipos de dominio de Capítulos.
5. `InvalidSummary` aparece en la saga, pero no está declarado en ningún sitio.
6. `ChapterPolicy`, `loadPolicy()` y `PlanId.from(timelineDTO, policy)` vienen de Codex y nadie los validó; sin `revision`, el `PlanId` pierde su razón de ser. Posible invento.
7. `GenerateChaptersUseCase` construye los `Chapter` con un `map` dentro del caso de uso: es lógica de dominio en la capa de aplicación.
8. `PrepareImagesUseCase` y `PrepareNarrationUseCase` se llaman como comandos, pero son queries: el nombre engaña.
