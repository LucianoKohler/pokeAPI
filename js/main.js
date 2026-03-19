pokemonState = "front_default";
currentData = JSON.parse(localStorage.getItem(25))
pokemonWeaknesses = {}
types =
["normal", "fighting", 
 "flying", "poison", 
 "ground", "rock", 
 "bug", "ghost", 
 "steel", "fire", 
 "water", "grass", 
 "electric", "psychic", 
 "ice", "dragon", 
 "dark", "fairy" ]


function capitalize(str){
    words = str.split("-");
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
    sound = await new Audio(currentData.data1.cries.latest)

    renderPokemonImage();

    // Locking/unlocking buttons
    changeButtonsAvailability()

    // Info-evo div
    document.getElementById("pokeName").innerHTML = capitalize(currentData.data1.name);
    document.getElementById("pokeNumber").innerHTML = "No° " + currentData.data1.id

    let desc = await findFirstEnglishEntry(currentData.data2.flavor_text_entries)
    
    document.getElementById("pokeDesc").innerHTML = await desc.flavor_text.replace("\f", " ").replace("\n", " ")

    // Type and miscelaneous badges
    let types = currentData.data1.types
    if(types.length == 1){
        document.getElementById("badges").innerHTML = `
        <img
        src='./assets/types/${types[0].type.name}.png'
        onmousemove="tooltip(event, 0)"
        onmouseout="hideTooltip()">`
    }else{
        document.getElementById("badges").innerHTML = `
        <img
        src='./assets/types/${types[0].type.name}.png'
        onmousemove="tooltip(event, 0)"
        onmouseout="hideTooltip()">
        <img
        src='./assets/types/${types[1].type.name}.png'
        onmousemove="tooltip(event, 1)"
        onmouseout="hideTooltip()">`
    }

    if(currentData.data2.is_legendary){
        document.getElementById("badges").innerHTML += `
        <img 
        src='./assets/icons/legendary.png'
        onmousemove="tooltip(event, 2)"
        onmouseout="hideTooltip()">`
    }

    if(currentData.data2.is_mythical){
        document.getElementById("badges").innerHTML += `
        <img 
        src='./assets/icons/mythical.png'
        onmousemove="tooltip(event, 3)"
        onmouseout="hideTooltip()">`
    }

    if(currentData.data2.is_baby){
        document.getElementById("badges").innerHTML += `
        <img 
        src='./assets/icons/baby.png'
        onmousemove="tooltip(event, 4)"
        onmouseout="hideTooltip()">`
    }

    if(currentData.data2.has_gender_differences){
        document.getElementById("badges").innerHTML += `
        <img 
        src='./assets/icons/gender_difference.png'
        onmousemove="tooltip(event, 5)"
        onmouseout="hideTooltip()">`
    }
    

    // Abilities
    let abilitiesData = currentData.data1.abilities
    let abilitiesDiv = document.getElementById("abilities")
    abilitiesDiv.innerHTML = ""

    for(let i = 0; i < abilitiesData.length; i++){

        // Accessing cache
        if(localStorage.getItem("ability_" + abilitiesData[i].ability.name)){
            console.log("cache da habilidade encontrado")
        }else{
            console.log("buscando habilidade na API")
            let abilityFetch = await fetch(abilitiesData[i].ability.url)
            abilityFetch = await abilityFetch.json()
            localStorage.setItem("ability_" + abilitiesData[i].ability.name, JSON.stringify(abilityFetch.flavor_text_entries))
        }

        abilityDesc = await JSON.parse(localStorage.getItem("ability_" + abilitiesData[i].ability.name))

        // Block of descriptions turns into a single english entry
        abilityDesc = await findFirstEnglishEntry(abilityDesc)

        // Creating the ability
        abilitiesDiv.innerHTML += `
            <div class="ability" onclick="showAbilityInfo(${i})">
                <span class="abilityName">${capitalize(abilitiesData[i].ability.name).replace("-", " ")}</span>
                <span class="abilityDesc">${abilityDesc.flavor_text}</span>
            </div>`
    }

    // Stats
    renderPokemonStats();

    // Moveset
    renderMoveset();

    // Weaknesses
    renderPokemonWeaknesses();

    // Misc div
    renderMiscDiv();

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

async function renderPokemonImage(){
    let img = currentData.data1.sprites[pokemonState]

    document.getElementById("PokeImage").src = img

    let backgroundDiv = document.getElementById("pokeImageDiv");
    let currentBackground;
/*
"normal", "fighting", 
 "flying", "poison", 
 "ground", "rock", 
 "bug", "ghost", 
 "steel", "fire", 
 "water", "grass", 
 "electric", "psychic", 
 "ice", "dragon", 
 "dark", "fairy" 
*/
    switch(currentData.data1.types[0].type.name){
        case 'normal':   background = 'forest'; break;
        case 'grass':    background = 'forest'; break;
        case 'bug':      background = 'forest'; break;
        case 'fighting': background = 'desert'; break;
        case 'ground':   background = 'desert'; break;
        case 'rock':     background = 'desert'; break;
        case 'fire':     background = 'desert'; break;
        case 'steel':    background = 'lab'; break;
        case 'electric': background = 'lab'; break;
        case 'water':    background = 'sea'; break;
        case 'ice':      background = 'sea'; break;
        case 'psychic':  background = 'peak'; break;
        case 'fairy':    background = 'peak'; break;
        case 'dragon':   background = 'sky'; break;
        case 'flying':   background = 'sky'; break;
        case 'dark':     background = 'night'; break;
        case 'poison':   background = 'night'; break;
        case 'ghost':    background = 'night'; break;
        default:         background = 'forest';
    }

    backgroundDiv.style.background = `url(../assets/habitats/pokeframe.png), url(../assets/habitats/${background}.png)`
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
    renderPokemonImage()
}

// Play pokémon's sound
async function makeSound(){
    let icon = document.getElementById("sound")
    
    icon.classList.add("playSound");
    icon.addEventListener("animationend", ()=>{ icon.classList.remove("playSound") })
    sound.play()
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

// Tooltip
function tooltip(e, whatToShow){
    let tooltip = document.getElementById("tooltip")
    tooltip.classList.remove("opacity")

    switch(whatToShow){
        case 0: // pokémon's first Type
            let content = currentData.data1.types[0].type.name
            tooltip.innerHTML = `This is a <b><i>${content.toUpperCase()}</i></b> type pokémon!`
            break
        case 1: // Show pokémon Type
            let content2 = currentData.data1.types[1].type.name
            tooltip.innerHTML = `This is a <b><i>${content2.toUpperCase()}</i></b> type pokémon!`
            break
        case 2:
            tooltip.innerHTML = "This is a <b><i>LEGENDARY</i></b> pokémon!"
            break;
        case 3:
            tooltip.innerHTML = "This is a <b><i>MYTHICAL</i></b> pokémon!"
            break;
        case 4:
            tooltip.innerHTML = "This is a <b><i>BABY</i></b> pokémon!"
            break;
        case 5:
            tooltip.innerHTML = "This pokémon has <b><i>gender differences!</i></b>"
            break;
        case 6:
            tooltip.innerHTML = "Play pokémon sound"
            break;
        case 7:
            tooltip.innerHTML = "Turn pokémon"
            break;
        case 8:
            tooltip.innerHTML = "Show shiny version"
            break;
        case 9:
            tooltip.innerHTML = "Swap gender"
            break;
        }


    tooltip.style.transform =
        `translate(calc(${e.clientX}px - 52%), ${e.clientY+30}px)`


}

hideTooltip = () => {document.getElementById("tooltip").classList.add("opacity")}
    
// Used for finding an english description for pokémon's description and ability description
async function findFirstEnglishEntry(data){
    for(let i = 0; i < data.length; i++){
        if(data[i].language.name == 'en'){
            return data[i]
        }
    }
    return "no english description found..."
    
}

async function renderPokemonWeaknesses(){
    
    // Finding cached or API fetched type 1
    type1 = null
    if(localStorage.getItem(`type_${currentData.data1.types[0].type.name}`)){
        console.log("Cache do tipo 1 encontrado")
        type1 = JSON.parse(localStorage.getItem(`type_${currentData.data1.types[0].type.name}`))
    }else{
        console.log("buscando tipo 1 na API")
        type1 = await fetch(currentData.data1.types[0].type.url)
        let type1Data = await type1.json()
        localStorage.setItem(`type_${currentData.data1.types[0].type.name}`, JSON.stringify(type1Data.damage_relations))

        type1 = type1Data.damage_relations
    }

    // Finding cached or API fetched type 2 (if exists)
    type2 = null
    if(currentData.data1.types.length > 1){
            if(localStorage.getItem(`type_${currentData.data1.types[1].type.name}`)){
            console.log("Cache do tipo 2 encontrado")
            type2 = JSON.parse(localStorage.getItem(`type_${currentData.data1.types[1].type.name}`))
        }else{
            console.log("buscando tipo 2 na API")
            type2 = await fetch(currentData.data1.types[1].type.url)
            let type2Data = await type2.json()
            localStorage.setItem(`type_${currentData.data1.types[1].type.name}`, JSON.stringify(type2Data.damage_relations))
            
            type2 = type2Data.damage_relations
        }
    }

    // Clearing weaknesses table, then finding weaknesses, strengths and invulnerabilities of type 1
    for(type of types)                       { pokemonWeaknesses[type] = 1; }
    for(weakness of type1.double_damage_from){ pokemonWeaknesses[weakness.name] = 2; }
    for(strength of type1.half_damage_from)  { pokemonWeaknesses[strength.name] = .5; }
    for(inv of type1.no_damage_from)         { pokemonWeaknesses[inv.name] = 0; }


    // Finding weaknesses, strengths and invulnerabilities of type 2 (if applicable)
    if(type2){
        for(weakness of type2.double_damage_from){ pokemonWeaknesses[weakness.name] *= 2; }
        for(strength of type2.half_damage_from)  { pokemonWeaknesses[strength.name] *= .5; }
        for(inv of type2.no_damage_from)         { pokemonWeaknesses[inv.name] *= 0; }
    }

    // Taking these data to the HTML table
    let cells = document.querySelectorAll(".weaknessCell");
    let i = 0;
    for(cell of cells){
        weakness = pokemonWeaknesses[types[i]]
        cell.innerHTML = weakness
        cell.className = `weaknessCell weakness_${weakness}`.replace("0.5", "05").replace("0.25", "025")
        i++;
    }
}

function prevNextPokemon(next){
    renderPokemon(currentData.data1.id + next);
}

async function renderMoveset(){
    let moves = await currentData.data1.moves;
    let movesDiv = document.getElementById("moveset");
    movesDiv.innerHTML = "<h2>Moveset</h2>";
    
    for(move of moves){
        movesDiv.innerHTML += `
        <details class="move">
            <summary><h3>${capitalize(move.move.name).replace("-", " ")}</h3></summary>
            <span>Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum</span>
        </details>`        
    }

    // CONTINUARRRRRRRRR
    // *****************
    // *****************
    // *****************
    // *****************
    // *****************
    // *****************
    // *****************
}

function renderMiscDiv(){
    document.getElementById("pokeHeight").innerHTML = `${currentData.data1.height/10}m`
    document.getElementById("pokeWeight").innerHTML = `${currentData.data1.weight/10}kg`

    let difficultyString = "";
    let difficulty = currentData.data2.capture_rate;

    if    (difficulty >= 190){ difficultyString = "Easy";              }
    else if(difficulty >= 90){ difficultyString = "Medium";            }
    else if(difficulty >= 30){ difficultyString = "Hard";              }
    else{                      difficultyString = "Almost Impossible"; }
    document.getElementById("pokeCatchRate").innerHTML = 
    `${currentData.data2.capture_rate}
    <span class="${difficultyString}">(${difficultyString})</span>`
}



document.getElementById("input").addEventListener("keypress", (e) => {
    if(e.key == "Enter"){
        renderPokemon(document.getElementById("input").value)
    }
})
document.getElementById("search").addEventListener("click", () => {renderPokemon(document.getElementById("input").value)})
renderPokemon(20)
