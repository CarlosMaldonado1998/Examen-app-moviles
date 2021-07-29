# Examen-app-moviles

La implementación del examen se ha realizado con Ionic Angular 

## 1 - Chat multiusuario con Login

Al iniciar la aplicación se cuenta con las vistas para: 
- Inicio de sesión 
- Recuperacion de contraseña 
- Registrar cuenta 



![alt text](https://raw.githubusercontent.com/CarlosMaldonado1998/Examen-app-moviles/master/imagenes/login.png)
![alt text](https://raw.githubusercontent.com/CarlosMaldonado1998/Examen-app-moviles/master/imagenes/recover.png)
![alt text](https://raw.githubusercontent.com/CarlosMaldonado1998/Examen-app-moviles/master/imagenes/register.png)

Para enviar mensajes de manera  simultanea con diferentes usuarios se inicia sesión con dos cuentas diferentes. 


## 2 - Base de datos en Firestore 

Para enviar mensajes el usuario escribe el mensaje y pulsa la opción de enviar mensaje de texto, para enviar texto deseado. 
![alt text](https://raw.githubusercontent.com/CarlosMaldonado1998/Examen-app-moviles/master/imagenes/sendMessage.png)

Esta información es guardada en una colección de firestore llamada chats 
![alt text](https://raw.githubusercontent.com/CarlosMaldonado1998/Examen-app-moviles/master/imagenes/database.png)


## 3 - Envio de imagenes en el chat 

Para enviar imagenes el usuario debe pulsar en la opción que dice elegir archivo, este le muestra un explorador de archivos. El 
usuario selecciona el archivo a enviar donde al finalizar la carga del archivo se muestra el mensaje con la imagen enviada. 
![alt text](https://raw.githubusercontent.com/CarlosMaldonado1998/Examen-app-moviles/master/imagenes/sendImage.png)

Estas imagenes son guardadas como parte del mensaje en Firestore, adicionalmente se crea una carpeta por usuario en la sección de Storage de Firestore 
donde el nombre de la carpeta tendra su nombres y su UID generado por firebase. 

![alt text](https://raw.githubusercontent.com/CarlosMaldonado1998/Examen-app-moviles/master/imagenes/storagebyUser.png)


## 4 - Envio de ubicación 

Finalmente para el envio de la locacalización se guardan como parte del mensaje las coordenadas de latitud y longitud que son proporcionada por el uso de librerias como:
- @ionic-native/geolocation
- @ionic-native/native-geocoder

Para enviar su ubicación el usuario solo debe dar clic en la boton de Enviar mi ubicación 

![alt text](https://raw.githubusercontent.com/CarlosMaldonado1998/Examen-app-moviles/master/imagenes/sendLocation.png)




