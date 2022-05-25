/****
paso 1: iniciar el proyecto con npm.
> npm init -y

paso 2: instalar el paquete axios.
> npm i axios

paso 3: instalar nodemon como una dependecia de desarrollo.
> npm i nodemon -D

paso 4: levanto el proyecto utilizando nodemon para que se carguen los cambios automaticamente.
> npx nodemon index.js

paso 5: comienzo a construir el programa para cumplir el desafio.
****/

/****
paso EXTRA: para evitar los problemas generdos con cors se puede instalar su paquete mediante la terminal: 
> npm i cors
****/

/* utilizo el modulo http para crear servidores. */
const http = require('http');
const axios = require('axios');
const cors = require('cors');

/* creo el servidor. Dentro creo una funcion la cual tendra dos callback; un request (peticion) y un response (respuesta). */
http.createServer(function(req, res){

    //console.log('servidor corriendo...');

    /* condicion en la que indico que requiero una url que comienza con el endpoint "pokemones". */
    if (req.url.startsWith('/pokemones')) {
        
        /* creo un nuevo arreglo vacio. 
        La idea es llenar este arreglo con las peticiones, para poder ordenar las respuestas por el orden numerico de cada pokemon. */
        let pokemones = [];

        /* creo una segunda funcion, pero para optimizar la carga del codigo,la declara arriba de getPokemones() 
        como parametro le indico que voy a recibir una url. */
        async function getData(url){
            const { data } = await axios.get(url);

            /* en la consola me aparece toda la informacion de los primeros 20 pokemon. Nombre, stats, ataques, habilidades, etc. */
            /* agrego el atributo name, para solo recibir los nombres delos primeros 20 pokemon. Los nombres no estaran impresos en su orden numerico, ya que es una promesa asincrona, y cada una se ejecuta al mismo tiempo, y las respuestas se imprimen al ir siendo cumplidas. */
            /* siguiendo la instruccion de lo que pide el ejercicio, hago una prueba en el console.log de los datos que necesito de cada pokemon; nombre, peso, altura. */
            //console.log(`${data.name} => Alto: ${data.height} - Peso: ${data.weight}`);

            /* una vez que se carguen los datos, los retorno. */
            return data;
        }

        /* lo primero sera consultar a la API mediante una funcion asincrona. */
        async function getPokemones(){

            /* cambio la url de la API para tener los primeros 151 pokemones. */
            let urlCompleta = 'https://pokeapi.co/api/v2/pokemon/?offset=0&limit=151'

            /* utilizo destructure { } para guardar la variable data. 
            con axios mas el verbo get (obtener)
            utilizo await para esperar a que llegue la informacion. */
            const { data } = await axios.get(urlCompleta);

            //console.log(data);

            /* la informacion de data llega dentro de un arreglo llamado results que tiene todos los elemenos de pokemon. 
            Por lo que lo usare para crear un foreach y recorrer el arreglo. */
            data.results.forEach(pokemon => {

                /* le envio la url que aparece en la api de cada pokemon a la funcion getData(). */
                //getData(pokemon.url);
                //console.log(pokemon);
                /* en consola la respuesta que me mostrara es: 
                { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' } */

                /* utilizo push para llenar el arreglo vacio pokemones, con puras promesas. */
                pokemones.push(getData(pokemon.url));

            });

            /* si intento imprimir mi arreglo con promesas, en la consola me aparecera: Pormise { <pending> } 20 veces. 
            Eso es porque aun las promesas no estan resueltas. */
            //console.log(pokemones);

            /* para poder resolver todas las promesas utilizo la funcion Promise.all() */
            /* PERO esta funcion tiene un gran problema, si 1 de todas las promesas falla, hace que falle todo el resto. */
            Promise.all(pokemones)
                /* con then() voy a poder tener los resultados ordenados, ya que espera a que todas las promesas se resuelvan en el orden especifico como estan en el array de la API. */
                .then(resultados => {

                    /* creo una respuesta, y como encabezado envio un codigo 200 para indicar que todo esta ok. */
                    /* ademas le digo que la data no sera enviada como html, sino que como una aplicacion de tipo json. */
                    res.writeHead(200,
                        /* para solucionar el problema con CORS agrego esta linea de codigo. */
                        {"Access-Control-Allow-Origin": "*"},
                        {'Content-type': 'application/json'});

                    /* creo un nuevo arreglo vacio, el cual se ira llenando con la informacion del objeto. */
                    let arrayPokemones = [];

                    /* utilizo un nuevo forEach para recorrer toda la data y mostrar la respuesta como estaba antes en getData(). */
                    resultados.forEach(pokemon => {
                        //console.log(`${pokemon.name} => Alto: ${pokemon.height} - Peso: ${pokemon.weight}`)

                        /* creo un nuevo objeto para definir SOLO la informacion que necesito. */
                        let objPokemon = {
                            /* agrego la ruta de la imagen. Los nombres de las propiedades deben ser iguales en el index.html */
                            //img: pokemon.sprites.front_default, 
                            img: pokemon.sprites.other.home.front_default,
                            nombre: pokemon.name,
                            altura: pokemon.height,
                            peso: pokemon.weight
                        }

                        arrayPokemones.push(objPokemon);
                    })

                    /* ahora debo enviar la informacion al front. 
                    para ello ocupo la variable res mas el metodo end() para cerrar la comunicacion. */
                    /* Y dentro del metodo, envio la informacion transformando el JSON en texto plano. */
                    res.end(JSON.stringify(arrayPokemones));

                })
                .catch(error => {
                    console.log('Ha ocurrido un error al traer la data')
                })

        }

        /* inicializo la funcion */
        getPokemones();

        //detener la carga de datos.
        //res.end();
    }
/* metodo listen el cual recibe como primer parametro el puerto por el que va a levantar el servidor. 
Y como segundo parametro, le puedo pasar un console.log para indicar que el servidor esta levantado. */
/* una buena idea tambien es agregar la url del servidor, para asi poder levantarlo desde la consola de visual studio. */
}).listen(3000 , console.log("Servidor corriendo en http://localhost:3000"))