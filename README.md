# 2019-1-Grupo3-Mobile

### Teconologías y versiones usadas

- Expo-cli 2.14.0
- Node 10.15.3
- Typescript 3.3
- Yarn 1.15.2

Paquetes principales: 

- Expo "^32.0.6"
- React "16.5.0"
- React Native "32.0.0"
- React Navigation "^3.3.2"
- React Redux "^6.0.0"
- Redux "^4.0.0"

### Run the App

Clonar el repositorio:

```git clone ```

Instalar dependencias:

```yarn install```

Correr la aplicación:

```yarn start``` o ```expo start```

### Guía de buenas prácticas

Deben respetar buenas prácticas de git:

1. *Commits* con nombres descriptivos.
2. *Commits* atómicos, es decir, responsabilidades claras y separadas.
3. *Commits* en inglés.
4. Respetar un *workflow* definido por ustedes.

#### 1. *Commits* con nombres descriptivos

Con *commits* con nombres descriptvos me refiero a *commits* del estilo:

```(<epica-tarjeta'>') fix/edit/add/create/etc: <explicación corta de la tarea>```
* As a User I want to read the list of courses: 
  * una sub-tarea sería crear los cursos, por lo tanto:
    * ej: (public courses) create: courses
  * o también podría necesitar crear la vista:
    * ej: (public courses) create: table view for list courses

#### 4. Respetar un *workflow* definido por ustedes
Ocuparemos *gitflow* con *code review*, ¿qué implica esto? 

##### *Gitflow*
Significa que existirán cuatro tipos de *branches*: 
* *Master*: 
  * *Branch* principal, con el contenido en producción.
* *Development*:
  * *Branch* que contiene todos las modificaciones revisadas del presente *sprint*.
* *Branch* secundaria:
  * *Branch* en la cual se crean todas las funciones nuevas y a la que luego se le hará *merge* con *Development*. 
* *Hot fix*:
  * *Branch* donde se harán arreglos que necesitan hacerse de forma inmediata a *Master* (ej: Producción no está funcionando y se busca arreglar eso)
  
 ##### *Code Review*
  
 Significa que para hacer el *merge* de una *branch* con otra será necesario hacer un *Pull Request*,
 donde otro compañero de equipo revisará su código y se asegurará de que lo hecho cumpla con:
 
 *  Sigue la guía de estilo establecida:
    * Código con nombres en inglés
    * Ordenado
    * Muchas otras definciones propias de la guía de estilo
 *  La funcionalidad hecha cumple con lo pedido
 *  Existe el *Test* correspondiente
 
 Una vez aprobada, a esta *branch* se le hará *merge* y se cerrará.
# capstoneMobile
