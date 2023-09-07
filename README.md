# **TFGcoldchain**
 Actualmente, la cadena de frío es una actividad fundamental que está presente de forma indirecta en la vida de las personas, ya que afecta desde el sector alimentario (por ejemplo, alimentos no perecederos) hasta medicamentos, vacunas o trasplantes de órganos. La rotura de un solo eslabón de la cadena estropea o deteriora el producto y, además, puede tener efectos perjudiciales para la salud y la calidad de vida de las personas, además de las correspondientes pérdidas económicas para las empresas.
  
  Con la forma tradicional de monitorear este proceso, no siempre se puede garantizar la integridad de la cadena, lo cual fue un problema reciente durante la pandemia con las vacunas contra la COVID. Bajo esa premisa surge este Trabajo de Fin de Grado (TFG), que consiste en la creación de un sistema para la monitorización de la cadena de frío mediante la utilización de sensores IoT (Internet de las Cosas), la tecnología blockchain y contratos inteligentes.
  
  La tecnología blockchain permitirá contar con una red descentralizada, segura y autónoma, además de facilitar la implementación de contratos inteligentes en el lenguaje Solidity para mejorar la eficiencia y automatización de la cadena.

  Los datos serán recogidos y publicados por dispositivos IoT, utilizando Arduino como plataforma de desarrollo.

  Se desarrollará una aplicación web con JavaScript, HTML, CSS y React para interactuar con la blockchain y con los datos recogidos por el sistema.

## **Hardware utilizado**
- Placa ESP8266 Node MCU v3.
- Módulo del sensor DHT11.

## **Tecnologías utilizadas**
- Solidity
- Truffle
- Ganache
- Metamask
- Arduino
- ReactJS
- JavaScript
- HTML
- CSS


## **Organización del proyecto**
 ### sketch_webserver
 Carpeta que contiene el archivo .ino que se encarga de que el sensor DHT11 registre las temperaturas y de que la placa ESP8266 cree un servidor web para almacenar los resultados.

 ### frontend
  - contracts: Esta subcarpeta contiene el codigo de los smart contracts desarrollados.
  - migrations: En esta subcarpeta se almacena la migración inicial y el despliegue de smart contracts.
  - public: Archivos que se muestran en la interfaz web.
  - src: Esta subcarpeta contiene el código que implementa la aplicación web. Entre otros, destaca el archivo **App.js**, que es el componente raíz que define la estructura general de la aplicación y lógica para controlar la visualización y el comportamiento de la interfaz de usuario. También contiene el archivo **authUtils.js**, que posee las funciones para el inicio de sesión. Por último, dentro podemos encontrar las siguientes carpetas:
     - src\Components: Componentes de React que implementan las diferentes funcionalidades.
     - src\Hooks: Contiene el archivo **utils.js** que integra la blockchain y los contratos desplegados.
     - src\Json: Carpeta en la que se almacenarán los JSON generados al compilar y desplegar los contratos con Truffle. Cuando se realice el despliegue, se generará dentro de la carpeta **frontend** una carpeta **builds** con dichos JSON, pero como create-react-app no deja utilizar archivos fuera de **src**, se copiarán los JSON generados a esta carpeta.
   
  Además de todas las carpetas mecionadas anteriormente, esta carpeta **frontend** contiene dos archivos JSON que trabajan en conjunto para administrar dependencias y asegurar la uniformidad, la capacidad de reproducción y la seguridad al definir versiones de dependencias y configuraciones del proyecto. También contiene el archivo de configuración de Truffle que sirve para definir cómo se compilan, migran y gestionan los contratos inteligentes.

 ## Instrucciones para su utilización
 Después de haber clonado el repositorio, instalamos las dependencias:
 ```sh
cd tfgcoldchain
cd frontend
npm i
```
Una vez que se han instalado las dependencias, abrimos Ganache y, en el archivo frontend\truffle-config.js, indicamos la nombre de red y el puerto utilizados por Ganache (por defecto 5777 en network_id y 7545 el puerto).
Una vez que se ha configurado el archivo, procedemos a compilar y desplegar los smart contracts con Truffle:
```sh
truffle compile
truffle migrate --reset
```
Esto nos generará una subcarpeta llamada **builds** dentro de **frontend**. Es necesario copiar los archivos JSON de esta carpeta en \src\Json.
Una vez que se han copiado los JSON, abrimos el archivo **sketch_webserver.ino** y dentro cambiamos la constante **ssid** por el nombre de la red WiFi a la que se va a conectar el servidor web, y cambiamos la constante **password** por la contraseña de dicha red WiFi.
Compilamos y ejecutamos ese archivo para desplegar el servidor web que registra las temperaturas (si no queremos probar la actualización y verificación de temperaturas no es necesario este paso). Nos saldrá por pantalla la dirección URL en la que se ha desplegado el servidor web.
En el archivo \src\Hooks\utils.js cambiamos el valor de la constante URL_SERVER por la dirección en la que se ha desplegado el servidor web, seguido de /data (e.j 192.168.140/data).
Finalmente, iniciamos con **npm** la página web del sistema utilizando:
```sh
cd frontend
npm start
```

Cabe destacar que para poder desplegar el servidor web correctamente, hay que instalar en Arduino la librería "DHT by Adafruit", el administrador de placas "esp8266 by ESP8266 Community" y la librería "ArduinoJson by Benoit Blanchon". Además de esto, en el apartado File -> Preferences -> Additional boards manager URL, hay que añadir la URL "http://arduino.esp8266.com/stable/package_esp8266com_index.json", que habilita el soporte para programar placas basadas en el ESP8266.
    
