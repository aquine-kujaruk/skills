# Tutorial: recorrer `pr-review` de principio a fin

Este recorrido prueba los tres casos de uso del plugin y el cierre automático:

1. configurar el repositorio;
2. implementar un cambio de ejemplo;
3. publicar la PR principal y su stack de revisión;
4. aplicar feedback nuevo y tardío;
5. terminar y limpiar la generación.

Solo el paso de implementación usa un prompt detallado. Las skills se invocan por su nombre, con un argumento únicamente cuando el objetivo no está claro en el contexto.

## Antes de empezar

Abre el repositorio en Codex o Claude Code. El agente debe tener acceso autenticado a GitHub y a la extensión oficial `github/gh-stack`. La rama fuente debe pertenecer al mismo repositorio, no a un fork.

Invocaciones equivalentes:

| Caso | Codex | Claude Code |
| --- | --- | --- |
| Configurar | `$pr-review:config` | `/pr-review:config` |
| Publicar | `$pr-review:start` | `/pr-review:start` |
| Aplicar feedback | `$pr-review:feedback` | `/pr-review:feedback` |

## Paso 1: configurar el repositorio

En una tarea con el repositorio abierto, invoca:

```text
$pr-review:config
```

La skill crea o reutiliza una PR lista hacia la rama por defecto con:

- `.github/pr-review.yml`;
- `.github/workflows/pr-review-close.yml`;
- `.github/scripts/pr-review-cleanup.sh`.

Revisa y mergea esa PR. `start` y `feedback` permanecerán bloqueadas hasta que esos archivos estén en la rama por defecto, Actions esté habilitado y exista el label configurado.

Si el repositorio ya está configurado, la skill lo verificará sin crear otra PR.

### Configuración con convenciones propias

La skill lee primero `AGENTS.md`, otras instrucciones del proyecto y la configuración existente. Para pedir una convención explícita, basta una invocación corta:

```text
$pr-review:config roles [inspection], [response], [proof]; branches checks/{id}/{index}-{slug}
```

La PR de configuración sigue siendo la única superficie que se mergea para activar esa política.

## Paso 2: implementar la demostración

Este no es un comando de `pr-review`. Es el prompt que debes pegar al agente para crear el cambio fuente:

> En el repositorio actual, cambia a `main`, actualízala con `git pull --ff-only` y crea la rama `agent/tutorial-pr-review` desde ese punto. Si la rama ya existe, intégrale primero la `main` actual sin eliminar sus commits. Modifica únicamente `tutorial/order.md` y crea tres commits pequeños. En el primero, añade un pedido con producto “Taza”, precio de 20 €, total de 20 € y estado “borrador”. En el segundo, añade un descuento de 5 € y expresa el total como `20 € - 5 € = 15 €`. En el tercero, cambia el estado a “listo para revisión” y añade un checklist de dos líneas: precio verificado y descuento verificado. Cada commit debe entenderse leyendo su diff. Ejecuta `git diff --check`. No hagas push, no abras PR y no hagas merge. Deja activa la rama creada y devuelve los tres commits en orden con una frase por cambio.

Al terminar debes tener:

- `agent/tutorial-pr-review` como rama activa;
- la rama contiene la versión actual de `docs/tutorial.md` y conserva los commits previos si ya existía;
- tres commits consecutivos;
- un árbol de trabajo limpio;
- ninguna PR nueva.

## Paso 3: publicar la revisión

En la misma tarea, con la rama fuente activa:

```text
$pr-review:start
```

Si la rama está en otro checkout o ya existe una PR, señala el objetivo:

```text
$pr-review:start agent/tutorial-pr-review
$pr-review:start 123
$pr-review:start https://github.com/OWNER/REPO/pull/123
```

Si ya conoces el identificador antes de crear la PR principal:

```text
$pr-review:start --id DEMO-123
```

La respuesta debe mostrar primero la PR principal y después las auxiliares de abajo arriba.

### Qué comprobar en GitHub

- La PR principal está lista, apunta a `main` y es la única que se mergea.
- Las capas `[review][ID]` están draft y cada una plantea una sola pregunta.
- Todas las auxiliares tienen únicamente el label `stack-review:managed` como identidad de gestión.
- La PR `[stack-source][ID]` también está draft.
- La PR principal y `stack-source` usan `agent/tutorial-pr-review` y comparten head SHA.
- `stack-source` tiene como base la última capa interna y muestra cero archivos cambiados.
- El agente aporta los dos tree IDs iguales, no solo SHAs iguales.
- Las ramas internas ya no existen localmente; la rama fuente sí.

Invocar `start` otra vez sobre la misma generación debe reutilizarla, no duplicarla.

## Paso 4: dejar feedback humano

En la capa que introduce el descuento, comenta la línea del total:

> Añade una línea separada que explique por qué el descuento es de 5 €.

También puedes comentar en la PR principal. Mantén el thread abierto: la resolución pertenece al reviewer.

## Paso 5: aplicar el feedback

Puedes pasar la PR principal o cualquier PR auxiliar:

```text
$pr-review:feedback 123
```

```text
$pr-review:feedback https://github.com/OWNER/REPO/pull/123
```

Si la tarea ya contiene la URL o la PR está seleccionada:

```text
$pr-review:feedback
```

### Qué comprobar

- La corrección completa llega primero a `agent/tutorial-pr-review` y actualiza la misma PR principal.
- La PR principal conserva título, body, base, labels, reviewers y estado.
- Aparece una capa `[feedback][ID]` draft inmediatamente debajo de `stack-source`.
- Su body enlaza el comentario original y contiene la verificación.
- El comentario original recibe una respuesta con la PR y el commit correctores.
- El thread sigue abierto.
- Las capas anteriores mantienen números, ramas, commits y comentarios.
- `stack-source` vuelve a mostrar cero archivos y el mismo head que la principal.
- La rama local de feedback desaparece tras verificar la publicación.

## Paso 6: feedback tardío y varios reviewers

Después de la primera corrección, deja un comentario nuevo en la primera capa:

> El producto debe incluir una referencia `TAZA-DEMO` para poder identificarlo.

Otro reviewer puede comentar a la vez en la PR principal:

> Añade al checklist una línea que confirme la referencia del producto.

Vuelve a invocar:

```text
$pr-review:feedback
```

La skill debe escanear otra vez la PR principal y todas las capas abiertas, incluidas las antiguas. Los comentarios ya marcados no generan otra corrección; los nuevos se agrupan por coherencia, no por reviewer ni por “ronda”.

Invocar `feedback` sin comentarios accionables nuevos no debe mutar ramas ni PRs.

## Paso 7: terminar la generación

Cuando la revisión esté terminada, mergea únicamente la PR principal. Para descartar la demostración, ciérrala sin mergear. Ambas acciones terminan la generación y activan `Close PR review stack`.

La Action debe:

1. eliminar la pertenencia al stack nativo;
2. cerrar todas las PR auxiliares;
3. borrar sus ramas remotas internas;
4. conservar la rama fuente, la PR principal y todo el historial de revisión.

No existe una skill `close`.

### Reintento manual

Si la Action falla, abre **Actions → Close PR review stack → Run workflow**, introduce el número de la PR principal cerrada y ejecútala otra vez. El cleanup es idempotente.

## Paso 8: reabrir una PR cerrada

Una PR principal cerrada sin merge puede reabrirse. Después invoca:

```text
$pr-review:start URL_DE_LA_PR_PRINCIPAL
```

La skill crea una generación nueva y deja cerrada la anterior. Una PR ya mergeada no puede iniciar otra generación.

## Diagnóstico rápido

| Síntoma | Acción |
| --- | --- |
| `start` o `feedback` bloqueada | Mergea primero la PR creada por `config` y comprueba Actions. |
| Una publicación falló a medias | Repite la misma invocación; la skill inspecciona y reutiliza lo ya publicado. |
| No aparece feedback nuevo | Comprueba que el comentario sea humano y accionable; vuelve a invocar `feedback` sobre cualquier PR activa. |
| Una auxiliar parece mergeable | Debe seguir draft y comenzar por un rol visible; no la mergees. |
| Quedan ramas locales internas | La ejecución no está completa; la skill debe verificar GitHub y retirarlas. |
| Cerraste la principal y quedan auxiliares | Reintenta el workflow manual con el número de la principal. |

## Resultado final esperado

Has usado `config`, `start` y `feedback`; probado comentarios nuevos, tardíos y de varios reviewers; verificado la doble vista de una misma rama; y cerrado la generación sin convertir el stack auxiliar en una segunda ruta de merge.
