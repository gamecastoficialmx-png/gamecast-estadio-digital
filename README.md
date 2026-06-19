# 🎮 Game Cast Estadio Digital — Página de Donaciones

Sitio web estático para recibir donaciones y contacto de la comunidad **Game Cast Estadio Digital**.

## 🚀 Tecnologías

| Función | Herramienta | Licencia |
|---------|-------------|---------|
| Donaciones recurrentes | [Liberapay](https://liberapay.com) | Open Source (MIT) |
| Donación única | [Ko-fi](https://ko-fi.com) | Freemium |
| Patrocinios / transparencia | [Open Collective](https://opencollective.com) | Open Source |
| Formulario de contacto | [Formspree](https://formspree.io) | Freemium (1000 envíos/mes gratis) |
| Hosting | [Netlify](https://netlify.com) | Gratis (plan Starter) |
| Código fuente | [GitHub](https://github.com) | — |

---

## 🛠️ Configuración paso a paso

### 1. Configurar Formspree

1. Crea una cuenta en [formspree.io](https://formspree.io)
2. Crea un nuevo formulario → copia el **Form ID** (ej: `xyzabcde`)
3. En `index.html`, reemplaza:
   ```html
   action="https://formspree.io/f/XXXXXXXX"
   ```
   con tu ID real:
   ```html
   action="https://formspree.io/f/xyzabcde"
   ```
4. También actualiza la URL de `_next` con tu dominio real:
   ```html
   <input type="hidden" name="_next" value="https://TU-SITIO.netlify.app/gracias.html" />
   ```

### 2. Configurar Liberapay

1. Crea una cuenta en [liberapay.com](https://liberapay.com)
2. Completa tu perfil de la comunidad
3. Reemplaza todos los enlaces `href="https://liberapay.com/"` con tu URL de perfil:
   ```
   https://liberapay.com/GameCastEstadioDigital/
   ```

### 3. Configurar Ko-fi

1. Crea una cuenta en [ko-fi.com](https://ko-fi.com)
2. Reemplaza los enlaces de Ko-fi con tu perfil:
   ```
   https://ko-fi.com/gamecastestadio
   ```

### 4. Subir a GitHub

```bash
git init
git add .
git commit -m "feat: initial donation page"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/gamecast-donaciones.git
git push -u origin main
```

### 5. Conectar a Netlify

1. Ve a [netlify.com](https://netlify.com) → **Add new site** → **Import an existing project**
2. Conecta tu cuenta de GitHub
3. Selecciona el repositorio `gamecast-donaciones`
4. Configuración de build:
   - **Build command:** *(dejar vacío, es sitio estático)*
   - **Publish directory:** `.`
5. Clic en **Deploy site**
6. (Opcional) Configurar dominio personalizado en **Domain settings**

---

## 📁 Estructura de archivos

```
gamecast/
├── index.html       ← Página principal
├── gracias.html     ← Página de confirmación tras contacto
├── style.css        ← Todos los estilos
├── main.js          ← Lógica del formulario y animaciones
├── netlify.toml     ← Configuración de Netlify (headers, redirects)
└── README.md        ← Este archivo
```

---

## ✅ Checklist de lanzamiento

- [ ] Reemplazar Form ID de Formspree en `index.html`
- [ ] Actualizar URL `_next` en el formulario
- [ ] Crear perfil en Liberapay y actualizar enlaces
- [ ] Crear perfil en Ko-fi y actualizar enlaces
- [ ] (Opcional) Crear colectivo en Open Collective
- [ ] Subir a GitHub
- [ ] Conectar a Netlify
- [ ] Verificar que el formulario de contacto envía correctamente
- [ ] Configurar dominio personalizado (si aplica)

---

## 🆓 Plataformas open source recomendadas

### Liberapay
- **Licencia:** MIT (código en GitHub)
- **Comisión:** 0% (solo tarifas Stripe/PayPal)
- **Donaciones:** Semanales, mensuales o anuales
- **Ideal para:** Donaciones recurrentes de comunidades

### Open Collective
- **Licencia:** MIT (código en GitHub)
- **Comisión:** ~10% (para cubrir costos de la plataforma)
- **Donaciones:** Únicas o recurrentes, con recibos fiscales
- **Ideal para:** Transparencia pública y patrocinios corporativos

### Ko-fi
- **Licencia:** Propietario (pero con integraciones abiertas)
- **Comisión:** 0% en plan Gold ($12/mes); 5% en plan gratuito
- **Donaciones:** Únicas principalmente
- **Ideal para:** Donaciones rápidas sin registro del donante
