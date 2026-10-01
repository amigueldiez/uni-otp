# Ule-OTP

Extensión de navegador (Chrome/Brave) para generar y rellenar automáticamente los códigos de verificación multifactor (MFA) del servicio de autenticación de la Universidad de León (`sso.unileon.es`).

## Qué hace

- **Genera** el código TOTP de 6 dígitos a partir de un secret base32.
- **Rellena** automáticamente ese código en el campo del formulario de verificación de `sso.unileon.es` al cargar la página, **sin pulsar el botón "Aceptar"**.
- Permite guardar el secret de dos formas: **sin contraseña** (simple) o **con contraseña** (cifrado local).

## Instalación (cargar desempaquetada)

1. Abre `chrome://extensions` (o `brave://extensions` en Brave).
2. Activa el **modo de desarrollador** (interruptor en la esquina superior derecha).
3. Haz clic en **Cargar descomprimida** (**Load unpacked**).
4. Selecciona la carpeta raíz de este proyecto (la que contiene `manifest.json`).

La extensión Ule-OTP aparecerá en tu barra de herramientas. También puedes fijarla haciendo clic en el icono de puzzle y después en el icono de la extensión.

## Configuración del token

1. Haz clic en el icono de Ule-OTP para abrir el popup.
2. Ve a la pestaña **Configuración**.
3. Pega tu secret **base32** (por ejemplo, el que te proporciona la Universidad de León o tu app autenticadora, como `JBSWY3DPEHPK3PXP`).
4. Elige el modo de almacenamiento (ver abajo).
5. Pulsa **Guardar**.

## Modos de almacenamiento

- **Sin contraseña (simple):** el secret se guarda en texto plano en el almacenamiento local del navegador. El código se muestra y se rellena automáticamente sin pedir nada.
- **Con contraseña (seguro):** el secret se cifra localmente con tu contraseña (PBKDF2 + AES-GCM). En la pestaña **Código** aparece una pantalla de **desbloqueo**:

  1. Introduce tu contraseña.
  2. Pulsa **Desbloquear**.

  Una vez desbloqueado, el código se muestra y se rellena automáticamente. Si cierras el navegador, tendrás que desbloquear de nuevo. En este modo el secret nunca se guarda en texto plano.

## Cómo funciona el autorrelleno

Cuando se carga una página de `https://sso.unileon.es/*`, la extensión:

- Detecta si la página es un formulario de verificación (por palabras clave y por el campo de código).
- Si encuentra un campo de código y hay un secret configurado, genera el código y lo **rellena** en el campo.
- El código se escribe en el campo, pero **no se pulsa** el botón "Aceptar": tú decides cuándo enviar el formulario.

> Nota: en el modo **con contraseña**, si no has desbloqueado el token en la sesión actual, el autorrelleno no se produce hasta que desbloquees en el popup.
