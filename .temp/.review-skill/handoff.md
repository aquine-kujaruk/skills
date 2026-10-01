# Handoff: cómo leer el paquete `.review`

Marco de lectura para quien construya el skill. No son especificaciones; esas están en `features/`.

## Diseño de sagas a partir de casos de uso

La unidad es el **caso de uso**. Una saga aparece solo cuando un flujo coordina varios casos de uso. No es obligatoria: si un endpoint u otro punto de entrada invoca un caso de uso directamente, el diseño muestra solo ese caso de uso, sin saga.

Con agentes de IA, quien desarrolla también tiene que actuar casi como experto. El paquete sirve para revisar a solas lo que propone la IA, y para consultar de forma asíncrona a un experto cuando haga falta. No es un taller de equipo ni un event storming.

## Sin eventos dibujados

Un paso con buen nombre ya dice qué hecho produce: quien lee `SelectFramesForChapter` entiende «frames selected». Etiquetar las transiciones con eventos repite información y añade ruido. Por eso no se dibujan.

Además, las sagas son **orquestación**. Hablar de eventos empuja hacia una arquitectura event-driven (publicación y suscripción, coreografía), que solo se adopta si se decide de forma explícita.

## Alcance: un universo cerrado que se apunta a cualquier cosa

Es análogo a show-me: se apunta a cualquier código, caso de uso o flujo imaginado, y no depende de OpenSpec ni de ninguna otra herramienta. La entrada típica es «dime cómo está hecha por dentro esta herramienta», a menudo vibe-codeada. Después se itera sobre qué mejorar, siempre con las mismas reglas de representación.

- Se representa solo el flujo pedido, y por defecto solo su happy path. Las compensaciones y los catch aparecen solo si se piden.
- Cuando se describe código existente, la representación es fiel: no se inventa ningún paso, y se respetan el orden y el paralelismo del código.
- Lo que el código hace de más y no cambia el resultado del flujo (métricas, tiempos, contabilidad de llamadas) se recorta.

## Comandos y queries

Cada caso de uso se cataloga por lo que es en esencia: un **comando** cambia el estado, aunque devuelva su resultado; una **query** no lo cambia. Un log no rompe una query, porque los logs ya se recortan de la representación. Van en `application/commands/` y `application/queries/`, y el color de la saga los distingue con la convención de event storming: azul = comando, verde = query (read model). Ambos van como tinte translúcido de relleno con borde sólido (`#4C8DF6` y `#009E73`). Así se leen con fondo claro y oscuro, y el texto azul de los enlaces mantiene el contraste aunque el nodo sea azul. No se usa naranja, que en event storming significa evento de dominio. El color dice de un vistazo qué se puede reintentar sin riesgo. Que una query sea cara (llama a un modelo de pago) no la convierte en comando.

## Canales visuales

El relleno es solo para comando/query. Los demás significados usan otros canales.

## Ideas pendientes de validar

1. **Riesgos:** una nota de una línea en el nodo, solo si la conversación los trató. (Las oportunidades ya están resueltas: las estructurales se ven en la saga; las de infraestructura van como comentario `// Opportunity:` sobre el método del repositorio, como mucho 3 por paquete).
2. **Lo que no cambia:** borde discontinuo, como contexto y sin detalle.
3. **Incoherencias del código** (por ejemplo, una «query» que escribe estado): otra nota en el nodo.
4. **Separar el riesgo de su respuesta:** primero el riesgo, después su `retry` o `catch`. Un riesgo sin respuesta es una decisión abierta.
