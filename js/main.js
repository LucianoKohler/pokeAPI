pokemonState = "front_default";
pokeData = {}
pokeSpeciesData = {}
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

 async function getObject(obj, id){
    let data;
    if(localStorage.getItem(`${obj}_${id}`)){
        console.log("cache do " + obj + " encontrado!");
        data = JSON.parse(localStorage.getItem(`${obj}_${id}`))
    }else{
        console.log("buscando " + obj + " na API");
        let dataFetch = await fetch(`https://pokeapi.co/api/v2/${obj}/${id}`)
        data = await dataFetch.json();

        try{
            localStorage.setItem(`${obj}_${id}`, JSON.stringify(data));
        }catch(e){
            if(e == "QuotaExceededError"){
                console.log("LS cheio, limpando!");
                localStorage.clear()
                localStorage.setItem(`${obj}_${id}`, JSON.stringify(data));
            }
        }
    }

    return data;
 }

function capitalize(str){
    words = str.split("-");
    finalWord = ""
    words.forEach((word) => {finalWord += word.charAt(0).toUpperCase() + word.slice(1) + " ";})

    return finalWord
}

async function renderPokemon(id){
    currentID = id
    pokeData = await getObject("pokemon", id);
    pokeSpeciesData = await getObject("pokemon-species", id);
    pokemonState = "front_default"
    sound = await new Audio(pokeData.cries.latest)

    renderPokemonImage();

    // Locking/unlocking buttons
    changeButtonsAvailability()

    // Info-evo div
    document.getElementById("pokeName").innerHTML = capitalize(pokeData.name);
    document.getElementById("pokeNumber").innerHTML = "No° " + pokeData.id

    let desc = await findFirstEnglishEntry(pokeSpeciesData.flavor_text_entries)
    
    document.getElementById("pokeDesc").innerHTML = await desc.flavor_text.replace("\f", " ").replace("\n", " ")

    // Type and miscelaneous badges
    let types = pokeData.types
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

    if(pokeSpeciesData.is_legendary){
        document.getElementById("badges").innerHTML += `
        <img 
        src='./assets/icons/legendary.png'
        onmousemove="tooltip(event, 2)"
        onmouseout="hideTooltip()">`
    }

    if(pokeSpeciesData.is_mythical){
        document.getElementById("badges").innerHTML += `
        <img 
        src='./assets/icons/mythical.png'
        onmousemove="tooltip(event, 3)"
        onmouseout="hideTooltip()">`
    }

    if(pokeSpeciesData.is_baby){
        document.getElementById("badges").innerHTML += `
        <img 
        src='./assets/icons/baby.png'
        onmousemove="tooltip(event, 4)"
        onmouseout="hideTooltip()">`
    }

    if(pokeSpeciesData.has_gender_differences){
        document.getElementById("badges").innerHTML += `
        <img 
        src='./assets/icons/gender_difference.png'
        onmousemove="tooltip(event, 5)"
        onmouseout="hideTooltip()">`
    }
    

    // Abilities
    let abilitiesData = pokeData.abilities
    let abilitiesDiv = document.getElementById("abilities")
    abilitiesDiv.innerHTML = ""

    for(let i = 0; i < abilitiesData.length; i++){
        abilityDesc = await getObject("ability", abilitiesData[i].ability.name);

        // Block of descriptions turns into a single english entry
        abilityDesc = await findFirstEnglishEntry(abilityDesc.flavor_text_entries)

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
    if(pokeData.sprites["back_default"] == null){
        document.getElementById("rotatePokemon").onclick = "";
        document.getElementById("rotatePokemon").classList.add("disabled")
    }else{
        document.getElementById("rotatePokemon").onclick = () => changeImageState(1);
        document.getElementById("rotatePokemon").classList.remove("disabled")
    }
    if(pokeData.sprites["front_shiny"] == null){
        document.getElementById("makeShiny").classList.add("disabled")
        document.getElementById("makeShiny").onclick = "";
    }else{
        document.getElementById("makeShiny").onclick = () => changeImageState(2);
        document.getElementById("makeShiny").classList.remove("disabled")
    }
    if(pokeData.sprites["front_female"] == null){
        document.getElementById("changeGender").classList.add("disabled")
        document.getElementById("changeGender").onclick = "";
    }else{
        document.getElementById("changeGender").onclick =() => changeImageState(3);
        document.getElementById("changeGender").classList.remove("disabled")
    }
}

async function renderPokemonImage(){
    let img = pokeData.sprites[pokemonState]

    document.getElementById("PokeImage").src = img

    let backgroundDiv = document.getElementById("pokeImageDiv");
    let background;

    switch(pokeData.types[0].type.name){
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

    backgroundDiv.style.background = `url(./assets/habitats/pokeframe.png), url(./assets/habitats/${background}.png)`
}

async function renderPokemonStats(){
    statsData = pokeData.stats
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
            let content = pokeData.types[0].type.name
            tooltip.innerHTML = `This is a <b><i>${content.toUpperCase()}</i></b> type pokémon!`
            break
        case 1: // Show pokémon Type
            let content2 = pokeData.types[1].type.name
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
    type1 = await getObject("type", pokeData.types[0].type.name)
    type1 = type1.damage_relations

    // Finding cached or API fetched type 2 (if exists)
    type2 = null
    if(pokeData.types.length > 1){
        type2 = await getObject("type", pokeData.types[1].type.name)
        type2 = type2.damage_relations
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
    renderPokemon(pokeData.id + next);
}

async function renderMoveset(){
    let moves = await pokeData.moves;
    let movesDiv = document.getElementById("moves");
    movesDiv.innerHTML = "";
    
    for(move of moves){
        movesDiv.innerHTML += `
        <details class="move" id = "${move.move.name}">
            <summary><h3>${capitalize(move.move.name).replace("-", " ")}</h3></summary>
            <div class="moveContent">
                <div id="moveArchetype">
                    <img src="assets/moveArchetypes/physical.png">
                    <b>Physical</b>
                </div>
                <hr>
                <div id="moveStats">
                    <span class="moveStat">Pow: --</span>
                    <span class="moveStat">Acc: --</span>
                    <span class="moveStat">PP : --</span>
                </div>
                <hr>
                <div id="moveMisc">
                    <span id="learnMethod">Learned Via <br><b>???</b></span>
                    <div>
                        Type: <img id="moveType" src="assets/types/no_type.png">
                    </div>
                </div>
            </div>
            <div id="moveDesc">Attack description</div>
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
    document.getElementById("pokeHeight").innerHTML = `${pokeData.height/10}m`
    document.getElementById("pokeWeight").innerHTML = `${pokeData.weight/10}kg`

    let difficultyString = "";
    let difficulty = pokeSpeciesData.capture_rate;

    if    (difficulty >= 190){ difficultyString = "Easy";              }
    else if(difficulty >= 90){ difficultyString = "Medium";            }
    else if(difficulty >= 30){ difficultyString = "Hard";              }
    else{                      difficultyString = "Almost Impossible"; }
    document.getElementById("pokeCatchRate").innerHTML = 
    `${pokeSpeciesData.capture_rate}
    <span class="${difficultyString}">(${difficultyString})</span>`

    // Other forms
    let otherFormsDiv = document.getElementById("forms");
    let otherForms = pokeSpeciesData.varieties
    otherFormsDiv.innerHTML = ""
    otherFormsDiv.classList = ""

    if(otherForms.length == 1){
        otherFormsDiv.innerHTML = "This pokémon does not have any other forms"
    }else{
        for(let i = 1; i < otherForms.length; i++){ // 1 cuz 0 is default form
                let imgID = (otherForms[i].pokemon.url).split("/")[6];

            otherFormsDiv.innerHTML += `
                <div class="form">
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${imgID}.png" alt="">
                    ${capitalize(otherForms[i].pokemon.name).replace("-", " ")}
                </div>`
        }
    }

    if(otherForms.length <= 3){ otherFormsDiv.classList = "centered"; }
}



document.getElementById("input").addEventListener("keypress", (e) => {
    if(e.key == "Enter"){
        renderPokemon(document.getElementById("input").value)
    }
})
document.getElementById("search").addEventListener("click", () => {renderPokemon(document.getElementById("input").value)})
renderPokemon(772)
