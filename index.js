
const http = require('http');
const axios = require('axios');
const cors = require('cors');

http.createServer(function(req, res){

    if (req.url.startsWith('/pokemones')) {
        
        let pokemones = [];

        async function getData(url){
            const { data } = await axios.get(url);
            return data;
        }

        async function getPokemones(){

            let urlCompleta = 'https://pokeapi.co/api/v2/pokemon/?offset=0&limit=151';

            const { data } = await axios.get(urlCompleta);

            data.results.forEach(pokemon => {

                pokemones.push(getData(pokemon.url));

            });

            Promise.all(pokemones)
                .then(resultados => {

                    res.writeHead(200,
                        /* para solucionar el problema con CORS agrego esta linea de codigo. */
                        {"Access-Control-Allow-Origin": "*"},
                        {'Content-type': 'application/json'});

                    let arrayPokemones = [];

                    resultados.forEach(pokemon => {

                        let objPokemon = {
                            //img: pokemon.sprites.front_default, 
                            img: pokemon.sprites.other.home.front_default,
                            nombre: pokemon.name,
                            altura: pokemon.height,
                            peso: pokemon.weight
                        }

                        arrayPokemones.push(objPokemon);
                    })

                    res.end(JSON.stringify(arrayPokemones));

                })
                .catch(error => {
                    console.log('Ha ocurrido un error al traer la data')
                })

        }

        getPokemones();

    }

}).listen(3000 , console.log("Servidor corriendo en http://localhost:3000"))