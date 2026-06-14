#!/usr/bin/env node
/**
 * @file generate-docs.js
 * @description Script de generación automática de documentación técnica.
 *
 * Proceso:
 *   1. Lee cada archivo HTML de /interfaces y JS de /js
 *   2. Envía el contenido a OpenAI GPT-4o con un prompt especializado
 *   3. Guarda la documentación generada en /docs/[modulo].md
 *
 * Variables de entorno requeridas:
 *   OPENAI_API_KEY — API key de OpenAI (configurada como GitHub Secret)
 *
 * Uso local:
 *   OPENAI_API_KEY=sk-... node scripts/generate-docs.js
 *
 * Uso en CI (GitHub Actions):
 *   El workflow ci.yml lo invoca automáticamente con el secret inyectado.
 */

const fs   = require('fs');
const path = require('path');

// ─── Verificar dependencia openai ──────────────────────────────────────────
let OpenAI;
try {
    OpenAI = require('openai').default;
} catch {
    console.error('❌  Paquete "openai" no encontrado. Ejecuta: npm install');
    process.exit(1);
}

// ─── Verificar API Key ─────────────────────────────────────────────────────
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
    console.error('❌  Variable de entorno OPENAI_API_KEY no encontrada.');
    console.error('    Configura el secret en GitHub o exporta la variable localmente.');
    process.exit(1);
}

// ─── Configuración ─────────────────────────────────────────────────────────
const ROOT       = path.resolve(__dirname, '..');
const DOCS_DIR   = path.join(ROOT, 'docs');
const INTERFACES = path.join(ROOT, 'interfaces');
const JS_DIR     = path.join(ROOT, 'js');

const client = new OpenAI({ apiKey: OPENAI_API_KEY });

// ─── Módulos a documentar ─────────────────────────────────────────────────
const MODULES = [
    {
        name:     'ventas',
        label:    'Módulo de Ventas — POS',
        files:    [{ dir: INTERFACES, file: 'ventas.html' }],
        jsFiles:  ['app.js', 'tailwind-config.js'],
    },
    {
        name:     'dashboard',
        label:    'Panel de Control — Dashboard',
        files:    [{ dir: INTERFACES, file: 'dashboard.html' }],
        jsFiles:  ['app.js'],
    },
    {
        name:     'inventario',
        label:    'Módulo de Inventario',
        files:    [{ dir: INTERFACES, file: 'inventario.html' }],
        jsFiles:  ['app.js'],
    },
    {
        name:     'citas',
        label:    'Módulo de Citas',
        files:    [{ dir: INTERFACES, file: 'citas.html' }],
        jsFiles:  ['app.js'],
    },
    {
        name:     'historias-clinicas',
        label:    'Módulo de Historias Clínicas',
        files:    [{ dir: INTERFACES, file: 'historias-clinicas.html' }],
        jsFiles:  ['app.js'],
    },
];

// ─── Prompt de sistema ─────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Eres un arquitecto de software técnico y redactor de documentación experto. 
Tu tarea es generar documentación técnica DETALLADA y PROFESIONAL en ESPAÑOL para un sistema web 
de gestión de clínica optométrica llamado "Dr. Lentes — Ópticas Clínicas".

Cuando recibas el código fuente de un módulo, genera documentación en formato Markdown que incluya:

## Estructura de la documentación a generar:

1. **Encabezado**: Nombre del módulo, versión, fecha, descripción general (2-3 párrafos)
2. **Tabla de Contenidos** con anclas de Markdown
3. **Descripción Funcional**: Qué hace el módulo desde el punto de vista del usuario final
4. **Arquitectura del Módulo**: Estructura HTML, patrón de diseño utilizado
5. **Componentes de la Interfaz**: Lista de todos los elementos de UI con su propósito
6. **Lógica JavaScript**: 
   - Tabla con cada función: nombre, parámetros, valor de retorno, descripción
   - Descripción del estado global (variables)
   - Flujos de datos y eventos
7. **Estructura de Datos**: Objetos/arrays del estado (productos, carrito, órdenes, etc.)
8. **Flujos de Usuario**: Diagramas Mermaid de los flujos principales
9. **Sistema de Diseño**: Clases y tokens usados, colores, tipografía
10. **Dependencias Externas**: Scripts CDN, fuentes, APIs referenciadas
11. **Guía de Mantenimiento**: Cómo extender o modificar el módulo
12. **Criterios de Aceptación**: Lista de funcionalidades que debe cumplir

Sé EXHAUSTIVO. La documentación debe ser útil para un desarrollador que nunca ha visto el código.
Incluye ejemplos de código en bloques \`\`\`html o \`\`\`javascript cuando sea relevante.
NO seas breve. Prefiere documentación larga y completa sobre documentación corta.`;

// ─── Función principal ─────────────────────────────────────────────────────
async function generateDocs() {
    // Crear directorio /docs si no existe
    if (!fs.existsSync(DOCS_DIR)) {
        fs.mkdirSync(DOCS_DIR, { recursive: true });
        console.log('📁  Directorio /docs creado.');
    }

    const results = [];

    for (const mod of MODULES) {
        console.log(`\n🤖  Generando documentación: ${mod.label}...`);

        // Leer archivos HTML del módulo
        let htmlContent = '';
        for (const { dir, file } of mod.files) {
            const filePath = path.join(dir, file);
            if (fs.existsSync(filePath)) {
                const raw = fs.readFileSync(filePath, 'utf-8');
                // Limitar a 12000 chars para no exceder context window
                htmlContent += `\n\n<!-- ARCHIVO: ${file} -->\n${raw.substring(0, 12000)}`;
                if (raw.length > 12000) htmlContent += '\n<!-- [CONTENIDO TRUNCADO PARA ANÁLISIS] -->';
            } else {
                console.warn(`  ⚠️  Archivo no encontrado: ${filePath}`);
            }
        }

        // Leer archivos JS compartidos
        let jsContent = '';
        for (const jsFile of mod.jsFiles) {
            const filePath = path.join(JS_DIR, jsFile);
            if (fs.existsSync(filePath)) {
                const raw = fs.readFileSync(filePath, 'utf-8');
                jsContent += `\n\n// ARCHIVO: ${jsFile}\n${raw.substring(0, 3000)}`;
            }
        }

        if (!htmlContent) {
            console.warn(`  ⚠️  Sin contenido para ${mod.name}, saltando...`);
            results.push({ module: mod.name, status: 'skipped' });
            continue;
        }

        const userPrompt = `Genera documentación técnica completa para el siguiente módulo:

**MÓDULO**: ${mod.label}
**SISTEMA**: Sistema Web Clínica Optométrica "Dr. Lentes"
**STACK**: HTML5, Tailwind CSS (CDN), JavaScript Vanilla, Material Symbols

=== CÓDIGO FUENTE HTML ===
${htmlContent}

=== CÓDIGO FUENTE JS COMPARTIDO ===
${jsContent}

Por favor genera la documentación técnica completa en español siguiendo las instrucciones del sistema.`;

        try {
            const response = await client.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system',  content: SYSTEM_PROMPT },
                    { role: 'user',    content: userPrompt },
                ],
                max_tokens:  4096,
                temperature: 0.3,
            });

            const docContent = response.choices[0].message.content;
            const outputPath = path.join(DOCS_DIR, `${mod.name}.md`);

            // Agregar encabezado con metadata
            const header = `---
module: ${mod.name}
label: "${mod.label}"
generated: "${new Date().toISOString()}"
generator: "OpenAI GPT-4o via generate-docs.js"
version: "1.0"
---

`;
            fs.writeFileSync(outputPath, header + docContent, 'utf-8');
            console.log(`  ✅  Documentación guardada: docs/${mod.name}.md (${docContent.length} chars)`);
            results.push({ module: mod.name, status: 'ok', chars: docContent.length });

        } catch (err) {
            console.error(`  ❌  Error generando docs para ${mod.name}: ${err.message}`);
            results.push({ module: mod.name, status: 'error', error: err.message });
        }

        // Pausa entre llamadas para respetar rate limits
        if (MODULES.indexOf(mod) < MODULES.length - 1) {
            await new Promise(r => setTimeout(r, 1500));
        }
    }

    // Generar índice README.md en /docs
    await generateDocsIndex(results);

    // Resumen final
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📚  RESUMEN DE GENERACIÓN DE DOCUMENTACIÓN:');
    results.forEach(r => {
        const icon = r.status === 'ok' ? '✅' : r.status === 'skipped' ? '⏭️ ' : '❌';
        console.log(`   ${icon}  ${r.module.padEnd(25)} ${r.status}${r.chars ? ` (${r.chars} chars)` : ''}`);
    });

    const failed = results.filter(r => r.status === 'error').length;
    if (failed > 0) {
        console.error(`\n❌  ${failed} módulo(s) fallaron. Revisa los errores arriba.`);
        process.exit(1);
    }
    console.log('\n✅  Documentación generada exitosamente.');
}

// ─── Genera el índice /docs/README.md ────────────────────────────────────
async function generateDocsIndex(results) {
    const now  = new Date();
    const date = now.toLocaleDateString('es-MX', { year:'numeric', month:'long', day:'numeric' });
    const time = now.toLocaleTimeString('es-MX');

    const moduleLinks = MODULES
        .map(m => {
            const r = results.find(r => r.module === m.name);
            const status = r?.status === 'ok' ? '✅' : r?.status === 'skipped' ? '⏭️' : '❌';
            return `| ${status} | [${m.label}](./${m.name}.md) | \`interfaces/${m.name}.html\` |`;
        })
        .join('\n');

    const content = `# 📚 Documentación Técnica — Sistema Clínica Optométrica

> **Generado automáticamente** por \`scripts/generate-docs.js\` usando OpenAI GPT-4o  
> **Última actualización:** ${date} a las ${time}

## Sistema: Dr. Lentes — Ópticas Clínicas

Sistema web de gestión para clínica optométrica. Incluye módulos de ventas (POS), 
inventario, historias clínicas, citas y panel de control.

**Stack:** HTML5 · Tailwind CSS CDN · JavaScript Vanilla · Material Symbols  
**Base de datos:** PostgreSQL 2.0 (37 tablas · 13 triggers)  
**Diseño:** "The Clinical Ethereal" (primario \`#00658d\`, Manrope + Inter)

---

## Módulos Documentados

| Estado | Módulo | Archivo fuente |
|--------|--------|----------------|
${moduleLinks}

---

## Cómo actualizar esta documentación

\`\`\`bash
# Localmente (requiere OPENAI_API_KEY exportada)
OPENAI_API_KEY=sk-... node scripts/generate-docs.js

# En CI
# El workflow .github/workflows/ci.yml lo ejecuta automáticamente
# en cada push a develop o main, usando el secret OPENAI_API_KEY
\`\`\`

---

*Este archivo es generado automáticamente. No editar manualmente.*
`;

    fs.writeFileSync(path.join(DOCS_DIR, 'README.md'), content, 'utf-8');
    console.log('\n  📄  Índice generado: docs/README.md');
}

// ─── Ejecutar ─────────────────────────────────────────────────────────────
generateDocs().catch(err => {
    console.error('💥  Error fatal:', err);
    process.exit(1);
});
