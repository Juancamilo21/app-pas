# Aplicación Móvil Desarrollada Con Ionic, Angular y Firebase (Realtime Database)

Se ha desarrollado una aplicación móvil para dispositivos Android con el propósito de permitir el control remoto de un sistema de alarma. Utilizando la tecnología de IoT (Internet de las cosas), se ha creado un dispositivo de alarma utilizando Arduino R3 y el módulo Wifi ESP-32. Este dispositivo se ha diseñado específicamente para controlar el nivel de ruido en bibliotecas.

* **Funciones del dispositivo:**
El funcionamiento de esta aplicación se basa en la detección de ruido a través de un sensor de sonido KY-038. La aplicación móvil permite establecer un umbral de sonido, y cuando este umbral se sobrepasa, se activa una alarma que emite un sonido discreto para alertar a las personas presentes, recordándoles que deben mantener silencio para no perturbar la tranquilidad del entorno. Además, cuando se activa la alarma, se registran automáticamente la fecha, hora y nivel analógico del sonido que la activó en Firebase. De esta manera, se crea un historial que muestra cuántas veces se ha activado la alarma.

* **Funciones de la App:**
La aplicación ofrece varias funcionalidades, como la capacidad de encender y apagar el dispositivo, así como establecer el umbral máximo de sonido permitido. Además, muestra un historial que registra la cantidad de veces que se ha activado la alarma en un día determinado, lo que permite filtrar el historial por fecha seleccionada. Adicionalmente, la aplicación proporciona estadísticas básicas que incluyen el nivel máximo de sonido registrado en un día, los valores mínimos, el rango de valores y la media. Estas estadísticas se presentan tanto en niveles analógicos como en decibelios (dB), brindando información detallada sobre el sonido ambiente.

## Imágenes de la App

<div align="center" style="display grid; grid-template-column: repeat(1fr, 3);">
    <img src="img-readme/img-control.png" alt="img-control" />
    <img src="img-readme/img-historial.png" alt="img-hstorial" />
    <img src="img-readme/img-statistic.png" alt="img-statistic" />
</div>

## Despues de clonar o descargar el proyecto realice lo siguiente

* #### Acceder al directorio del proyecto

    ```bash
    cd app-pas
    ```
* #### Instalar las dependencias

    ```bash
    npm install
    ```
* #### Ejecutar la Aplicación

    ```bash
    ionic serve
    ```
## Generar la Aplicación Android

Para generar la aplicación se usa capacitor que es una herramieta que permite convertir una aplicación web en una aplicación móvil android o ios, en este caso nos enfocamos en android, realice lo siguiente para generar la app.

```bash
ionic cap add android
```
con esto se genera la carpeta android, luego se debe crear el build del proyecto, para ello realice.

```bash
ionic cap sync
```
Luego se debe ejecutar la app, tenga en cuenta que debe tener Android Studio instalado en su computadora, puesto que, capacitor usa el IDE ofical de la plataforma para compilar la app, para ello realice.

```bash
ionic cap open android
```
Con esto se abrira Android Studio y podrá compilar la aplicación y generar el apk correspondiente.