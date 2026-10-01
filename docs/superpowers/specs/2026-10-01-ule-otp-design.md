# Ule-OTP — Diseño

## Resumen

Extensión para navegadores Chromium (Chrome, Brave, etc.) que genera códigos TOTP
para la autenticación multifactor de la Universidad de León y rellena
automáticamente el código en la pantalla SSO de `sso.unileon.es`.

## Objetivo

1. El usuario configura una vez el secreto base32 de su aplicación autenticadora.
2. La extensión muestra en su popup el código TOTP vigente.
3. Al detectar la pantalla "Autenticación multifactor / Introduzca código de
   verificación" en una página del dominio `sso.unileon.es/...`, la extensión
   rellena automáticamente el campo del código (sin pulsar "Aceptar").

## Alcance

- Extension Manifest V3 en JavaScript puro, sin dependencias externas ni build step.
- Sin back-end: todo el procesamiento (generación TOTP, cifrado) ocurre localmente
  en el navegador. Ningún dato sale del dispositivo.

## Arquitectura

Componentes:

| Archivo | Responsabilidad |
|---------|-----------------|
| `manifest.json` | Configuración MV3, permisos, content script y popup. |
| `popup.html` / `popup.js` / `popup.css` | Interfaz: pestaña Código, pestaña Configuración, pantalla de desbloqueo. |
| `totp.js` | Generación de códigos TOTP (HMAC-SHA1, 6 dígitos, periodo 30 s) usando Web Crypto. |
| `crypto.js` | Derivación de clave PBKDF2 y cifrado/descifrado AES-GCM (modo seguro). |
| `content.js` | Detección de la pantalla multifactor en `sso.unileon.es/...` y autorrelleno del código. |

## Flujo de datos

1. **Configuración:** el usuario pega el secret base32 y elige el modo de
   almacenamiento (ver sección Seguridad). Se guarda en `chrome.storage.local`.
2. **Generación:** el popup y el content script calculan el TOTP vigente a partir
   del secret.
3. **Autorrelleno:** al cargar una página en `sso.unileon.es/...`, el content
   script identifica el campo de código, calcula/obtiene el TOTP y rellena el
   campo automáticamente. No pulsa "Aceptar".
4. **Popup:** muestra el código vigente con cuenta atrás y permite rellenar
   manualmente en la página activa.

## Seguridad

La extensión ofrece dos modos de almacenamiento del secret, elegidos por el
usuario en Configuración.

### Modo A — Sin contraseña (simple)

- El secret base32 se guarda en `chrome.storage.local` sin cifrar.
- Al abrir el popup, el código se muestra directamente.
- Ventaja: máxima comodidad. Riesgo: cualquiera con acceso al perfil del
  navegador puede leer el secret.

### Modo B — Cifrado con contraseña (seguro)

- El secret se cifra con **AES-GCM**.
- La clave se deriva de la contraseña del usuario mediante **PBKDF2** (salt
  aleatorio, ~210 000 iteraciones, función hash SHA-256).
- Solo se persisten el salt, el IV y el dato cifrado. La contraseña **nunca** se
  guarda; solo se usa para derivar la clave y descifrar en memoria.
- Para ver el código o autorrellenar, el usuario debe **desbloquear** introduciendo
  su contraseña. Se muestra una pantalla de desbloqueo al abrir el popup si el
  modo está cifrado y no hay desbloqueo activo.
- El estado de desbloqueo se mantiene solo en la memoria de la sesión (se vuelve a
  pedir al cerrar el popup).

### Nota sobre autorrelleno en modo B

El content script corre en la página SSO. Para autorrellenar en modo B, la clave
se descifra en el popup/service worker y el código generado se envía
temporalmente al content script. Esto evita pedir la contraseña en cada página
SSO, a cambio de que el código pase brevemente por el content script. El usuario
debe aceptar conscientemente este trade-off.

## Detección de la página SSO

El content script se registra para `https://sso.unileon.es/*`. Detección de la
pantalla multifactor por heurísticas:

- Presencia de un campo de entrada de tipo `text`/`tel` o con `name`/`id` que
  contenga `code`, `otp`, `token`, `mfa`, `verification`, etc.
- Presencia de textos como "código de verificación", "Autenticación multifactor",
  "doble factor", etc.

Cuando se detecta la pantalla, se rellena el campo con el TOTP vigente.

## Permisos del manifest

- `storage` — persistir configuración y secret.
- `activeTab` y `scripting` — para que la pestaña Configuración pueda rellenar el
  campo en la pestaña activa desde el popup.
- Content script declarado para `https://sso.unileon.es/*`.

## Pruebas

- Pruebas unitarias del algoritmo TOTP (`totp.js`) con vectores de prueba
  estándar RFC 6238/4226.
- Pruebas unitarias del cifrado/descifrado (`crypto.js`): round-trip y verificación
  de contraseña incorrecta.
- Pruebas de la lógica de detección del content script (heurísticas de detección).
- Verificación manual: carga de la extensión sin empaquetar en Chrome/Brave,
  configuración del secret, generación del código en el popup y autorrelleno en una
  URL de prueba que simule la pantalla SSO.

## Fuera de alcance (YAGNI)

- Soporte de múltiples cuentas/servicios.
- Escaneo de códigos QR o importación `otpauth://`.
- Sincronización del secret con la cuenta del navegador.
- Soporte de Firefox (se puede adaptar fácilmente, pero no es objetivo).
