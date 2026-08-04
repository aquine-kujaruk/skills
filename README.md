# Plugins y skills de Aquine

Repositorio público para distribuir plugins y skills independientes. Cada plugin es un paquete
autocontenido para Codex y Claude Code; una skill solo aparece fuera de un plugin cuando se publica
de forma independiente.

## Catálogo

| Plugin | Para qué sirve | Documentación |
| --- | --- | --- |
| `webapp` | Guía a una persona no técnica desde una idea o aplicación existente hasta cambios desplegados y verificados. | [Instalar y usar](plugins/webapp/README.md) |
| `pr-review` | Mantiene una PR principal para merge y un stack draft paralelo para revisar el cambio por capas. | [Instalar y usar](plugins/pr-review/README.md) |

## Instalación rápida

### Codex

Registra el catálogo una vez e instala solo el plugin que necesites:

```bash
codex plugin marketplace add aquine-kujaruk/skills --ref main
codex plugin add webapp@aquine-skills
codex plugin add pr-review@aquine-skills
```

También puedes instalarlos desde `/plugins` después de registrar el catálogo.

### Claude Code

```text
/plugin marketplace add aquine-kujaruk/skills
/plugin install webapp@aquine-skills
/plugin install pr-review@aquine-skills
```

Ejecuta `/reload-plugins` si Claude Code lo solicita. Abre una tarea nueva después de instalar o
actualizar un plugin.

## Estructura

```text
plugins/webapp/      # plugin autocontenido
plugins/pr-review/   # plugin autocontenido
.agents/plugins/     # catálogo de Codex
.claude-plugin/      # catálogo de Claude Code
```

Los futuros plugins seguirán `plugins/<nombre>/`. Las futuras skills independientes usarán
`skills/<nombre>/` y no duplicarán contenido de un plugin.
