pokemonState = "front_default";
currentData = JSON.parse(localStorage.getItem(25))

function capitalize(str){
    words = str.split(" ");
    finalWord = ""
    words.forEach((word) => {finalWord += word.charAt(0).toUpperCase() + word.slice(1) + " ";})

    return finalWord
}


async function getPokemonById(id){
    // Cache
    if(localStorage.getItem(id)) {
        console.log("cache encontrado");
        currentData = JSON.parse(localStorage.getItem(id))
        return JSON.parse(localStorage.getItem(id));
    }

    console.log("Buscando da API")
    const apiFetch = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data1 = await apiFetch.json();

    const flavorTextFetch = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
    const data2 = await flavorTextFetch.json();

    try{
        localStorage.setItem(id, JSON.stringify({data1, data2}));
    }catch (e){
        if(e.name == "QuotaExceededError"){
            console.log("LS cheio, limpando!");
            localStorage.clear()
            localStorage.setItem(id, JSON.stringify({data1, data2}));
        }else{
            throw e;
        }
    }
    currentData = {data1, data2}

    return {data1, data2}
}

async function renderPokemon(id){
    currentID = id
    data = await getPokemonById(id);
    pokemonState = "front_default"
    renderPokemonImage(data, pokemonState);

    // Locking/unlocking buttons
    changeButtonsAvailability()

    // Info-evo div
    document.getElementById("pokeName").innerHTML = capitalize(data.data1.name);
    document.getElementById("pokeNumber").innerHTML = "No° " + data.data1.id
    document.getElementById("pokeDesc").innerHTML = (data.data2.flavor_text_entries[0].flavor_text).replace("\f", " ")

    // Type and miscelaneous badges
    let types = currentData.data1.types
    console.log(types)
    if(types.length == 1){
        document.getElementById("badges").innerHTML = `<img src='./assets/types/${types[0].type.name}.png'>`
    }else{
        document.getElementById("badges").innerHTML = `
        <img src='./assets/types/${types[0].type.name}.png'>
        <img src='./assets/types/${types[1].type.name}.png'>`
    }

    if(currentData.data2.is_legendary){
        document.getElementById("badges").innerHTML += `<img src='./assets/icons/legendary.png'>`
    }

    if(currentData.data2.is_mythical){
        document.getElementById("badges").innerHTML += `<img src='./assets/icons/mythical.png'>`
    }

    if(currentData.data2.is_baby){
        document.getElementById("badges").innerHTML += `<img src='./assets/icons/baby.png'>`
    }

    if(currentData.data2.has_gender_differences){
        document.getElementById("badges").innerHTML += `<img src='./assets/icons/gender_difference.png'>`
    }
    

    // Abilities
    let abilitiesData = currentData.data1.abilities
    let abilitiesDiv = document.getElementById
    for(let i = 0; i < abilitiesData.length; i++){

    }

    // Stats
    renderPokemonStats();

};

// Makes the buttons under the pokémon image clickable or not depending if there are images accordingly
function changeButtonsAvailability(){
    if(currentData.data1.sprites["back_default"] == null){
        document.getElementById("rotatePokemon").onclick = "";
        document.getElementById("rotatePokemon").classList.add("disabled")
    }else{
        document.getElementById("rotatePokemon").onclick = () => changeImageState(1);
        document.getElementById("rotatePokemon").classList.remove("disabled")
    }
    if(currentData.data1.sprites["front_shiny"] == null){
        document.getElementById("makeShiny").classList.add("disabled")
        document.getElementById("makeShiny").onclick = "";
    }else{
        document.getElementById("makeShiny").onclick = () => changeImageState(2);
        document.getElementById("makeShiny").classList.remove("disabled")
    }
    if(currentData.data1.sprites["front_female"] == null){
        document.getElementById("changeGender").classList.add("disabled")
        document.getElementById("changeGender").onclick = "";
    }else{
        document.getElementById("changeGender").onclick =() => changeImageState(3);
        document.getElementById("changeGender").classList.remove("disabled")
    }
}

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
        statColor = `hsl(${(statsData[i].base_stat / 255) * 200}, 100%, 45%)`
        statBars[i].style.setProperty("--color", statColor);
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

// Play pokémon's sound
function makeSound(){
    console.log("WIP")
    console.log(sound)
}

// All porpouse function
async function getFromAPI(query, id){
    const apiFetch = await fetch(`https://pokeapi.co/api/v2/${query}/${id}`);
    const data = await apiFetch.json();
}

function showAbilityInfo(divNum){
    let abilities = document.querySelectorAll(".ability")

    for(let i = 0; i < abilities.length; i++){
        if(i == divNum){
            abilities[i].classList.toggle("clicked")
        }else{
            abilities[i].classList.toggle("invisible")
        }
    }

}

renderPokemon(25)