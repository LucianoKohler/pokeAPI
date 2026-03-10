pokemonState = "front_default";
currentData = JSON.parse(localStorage.getItem(25))

async function getPokemonById(id){
    // Cache
    if(localStorage.getItem(id)) {
        console.log("cache encontrado: " + JSON.parse(localStorage.getItem(id)));
        currentData = JSON.parse(localStorage.getItem(id))
        return JSON.parse(localStorage.getItem(id));
    }

    console.log("Buscando da API")
    const apiFetch = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data1 = await apiFetch.json();

    const flavorTextFetch = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
    const data2 = await flavorTextFetch.json();

    localStorage.setItem(id, JSON.stringify({data1, data2}));
    currentData = {data1, data2}

    return {data1, data2}
}

async function renderPokemon(id){
    currentID = id
    data = await getPokemonById(id);
    renderPokemonImage(data, pokemonState);

    // Info-evo div
    document.getElementById("pokeName").innerHTML = (data.data1.name).charAt(0).toUpperCase() + (data.data1.name).slice(1);
    document.getElementById("pokeNumber").innerHTML = "No° " + data.data1.id
    document.getElementById("pokeDesc").innerHTML = (data.data2.flavor_text_entries[0].flavor_text).replace("\f", " ")


    renderPokemonStats();
};

async function renderPokemonImage(data = currentData, state){
    img = await currentData.data1.sprites[state]
    document.getElementById("PokeImage").src = img
}

async function renderPokemonStats(){
    statsData = currentData.data1.stats
    sum = 0;

    stats = document.querySelectorAll(".stat")
    statBars = document.querySelectorAll(".statBar")

    for(i = 0; i < 6; i++){
        sum += statsData[i].base_stat 
        stats[i].innerHTML = statsData[i].base_stat
        statBars[i].value = statsData[i].base_stat
    }
    stats[6].innerHTML = sum
}

function changeImageState(action){
    switch(action){
        case 1:
            switch (pokemonState) {
                case "front_shiny":       pokemonState = "back_shiny"; break;
                case "front_shiny_female":pokemonState = "back_shiny_female"; break;
                case "front_female":      pokemonState = "back_female"; break;
                case "front_default":     pokemonState = "back_default"; break;
                case "back_shiny":        pokemonState = "front_shiny"; break;
                case "back_shiny_female": pokemonState = "front_shiny_female"; break;
                case "back_female":       pokemonState = "front_female"; break;
                case "back_default":      pokemonState = "front_default"; break;
            }
            break;
        case 2:
            switch (pokemonState) {
                case "front_shiny":       pokemonState = "front_default"; break;
                case "front_shiny_female":pokemonState = "front_female"; break;
                case "front_female":      pokemonState = "front_shiny_female"; break;
                case "front_default":     pokemonState = "front_shiny"; break;
                case "back_shiny":        pokemonState = "back_default"; break;
                case "back_shiny_female": pokemonState = "back_female"; break;
                case "back_female":       pokemonState = "back_shiny_female"; break;
                case "back_default":      pokemonState = "back_shiny"; break;
            }
            break;
        case 3:
            switch (pokemonState) {
                case "front_shiny":       pokemonState = "front_shiny_female"; break;
                case "front_shiny_female":pokemonState = "front_shiny"; break;
                case "front_female":      pokemonState = "front_default"; break;
                case "front_default":     pokemonState = "front_female"; break;
                case "back_shiny":        pokemonState = "back_shiny_female"; break;
                case "back_shiny_female": pokemonState = "back_shiny"; break;
                case "back_female":       pokemonState = "back_default"; break;
                case "back_default":      pokemonState = "back_female"; break;
            }
    }
    renderPokemonImage(undefined, pokemonState)
}

// All porpouse function
async function getFromAPI(query, id){
    const apiFetch = await fetch(`https://pokeapi.co/api/v2/${query}/${id}`);
    const data = await apiFetch.json();
}

renderPokemon(25)