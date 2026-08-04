# Webapp

Flujo agéntico para que una persona no técnica pueda crear, adoptar y evolucionar una aplicación
web hablando en lenguaje natural. El plugin conserva producción operativa, convierte cada petición
en trabajo verificable y acompaña los pasos que necesitan intervención humana.

## Instalar en Codex

```bash
codex plugin marketplace add aquine-kujaruk/skills --ref main
codex plugin add webapp@aquine-skills
```

Abre una tarea nueva y comienza con `$webapp:setup`, `$webapp:adopt` o `$webapp:next`.

## Instalar en Claude Code

```text
/plugin marketplace add aquine-kujaruk/skills
/plugin install webapp@aquine-skills
```

Ejecuta `/reload-plugins` si se solicita. Las invocaciones principales son `/webapp:setup`,
`/webapp:adopt` y `/webapp:next`.

## Flujo principal

| Skill | Uso |
| --- | --- |
| `setup` | Crea y despliega una aplicación nueva. |
| `adopt` | Incorpora una aplicación existente sin alterar producción. |
| `next` | Convierte una petición en un cambio desplegado y verificado. |
| `migrate` | Mueve datos con comprobaciones y rollback. |
| `gaps` | Señala una carencia importante que nadie pidió. |
| `graphify` | Construye el mapa de relaciones del repositorio. |

Para una aplicación nueva, instala el plugin y pide que configure el proyecto. Para una aplicación
existente, abre su repositorio y pide que la adopte. Después, describe cada cambio con tus propias
palabras; `next` organiza la implementación, las comprobaciones y el despliegue.
