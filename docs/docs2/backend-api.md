# INFORMACIÓN

1- AXIOS: 
- Es una biblioteca basada en promesas para realizar peticiones HTTP tanto en el navegador como en Node.js.
- Aunque exsiste fetch (que es el nativo de JS), Axios es el estándar
- ¿por qué es el estandar?
    . Interceptores: Permite ejecutar codigo antes de que una peticion salga o antes que una respuesta llegue.
        - ejemplo: añadir un token de seguridad automáticamente
    . Transformación automaitca: Convierte los datos a JSON por ti, sin necesidad de hacer .json() manualmente.
    . Compatibilidad: Maneja mejor los errores de red y es compatible con  navegadores antiguos.

- pero si ya hay fetch por que axios?
    - pues fetch oblifa a siempre hacer el paso de .json, axios lo hace solo.
    - fetch tampoco se entera si el servidor ha fallado, el no ve eso y para el todo esta bien, a cambio axios te avisa.
    - en fetch es escribibr mucho codigo y repetido, axios permite crear una instacia con la URL ya puesta y ahrraar tiempp.

2- POSTMAN 
- sirve para diseñar, construir y sobre todo, testear APIs.
- este permite a los desarrolladores enviar peticiones (get, post,, delete)

3- SENTRY
- Es una plataforma de rastreo de errores en tiempo real.
- se usa en produccion, si un usuario tiene un error en su navegador o el servidor se cae, el desarrollador no está ahí para verlo.
- es muy util porque Sentry captura el error, guarda la línea exacta de código donde falló y te envía una alerta, es importante para arreglar fallos antes de que afecten a más usuarios.

4- SWAGGER
- es un conjunto de herramientas basada en la especificación OpenAPI para documentar APIs.
- Una API sin documentación es inútil para otros programadores, entonces esto nos ayuda a que otros puedan entender.
- este genera una página web automática donde se listan todos los Endpoints, qué datos necesitan recibir y qué devuelven. Además, permite "probar" la API desde la propia documentación sin escribir una sola línea de código.