# Uni-OTP

Extensión de navegador (Chrome/Brave) para generar y rellenar automáticamente los códigos de verificación multifactor (MFA) del servicio de autenticación de la Universidad de León (`sso.unileon.es`).

## Qué hace

- **Genera** el código TOTP de 6 dígitos a partir de un secret base32.
- **Rellena** automáticamente ese código en el campo del formulario de verificación de `sso.unileon.es` al cargar la página, **sin pulsar el botón "Aceptar"**.
- Guarda el secret en texto plano en el almacenamiento local del navegador.

## Instalación (cargar desempaquetada)

1. Abre `chrome://extensions` (o `brave://extensions` en Brave).
2. Activa el **modo de desarrollador** (interruptor en la esquina superior derecha).
3. Haz clic en **Cargar descomprimida** (**Load unpacked**).
4. Selecciona la carpeta raíz de este proyecto (la que contiene `manifest.json`).

La extensión Uni-OTP aparecerá en tu barra de herramientas. También puedes fijarla haciendo clic en el icono de puzzle y después en el icono de la extensión.

## Configuración del token

1. Haz clic en el icono de Uni-OTP para abrir el popup.
2. Ve a la pestaña **Configuración**.
3. Pega tu secret **base32** (por ejemplo, el que te proporciona la Universidad de León o tu app autenticadora, como `JBSWY3DPEHPK3PXP`).
4. Pulsa **Guardar**.

## Almacenamiento

El secret se guarda en texto plano en el almacenamiento local del navegador. El código se muestra y se rellena automáticamente sin pedir nada.

## Cómo funciona el autorrelleno

Cuando se carga una página de `https://sso.unileon.es/*`, la extensión:

- Detecta si la página es un formulario de verificación (por palabras clave y por el campo de código).
- Si encuentra un campo de código y hay un secret configurado, genera el código y lo **rellena** en el campo.
- El código se escribe en el campo, pero **no se pulsa** el botón "Aceptar": tú decides cuándo enviar el formulario.
