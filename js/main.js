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
moveOffset = 0;


 // Most important function, gets anything from the API, caches, and returns it.
 async function getObject(obj, id){
    let data;
    if(localStorage.getItem(`${obj}_${id}`)){
        console.log("cache do " + obj + " encontrado!");
        data = JSON.parse(localStorage.getItem(`${obj}_${id}`))
    }else{
        console.log("buscando " + obj + " na API");
        let dataFetch;
        try{
            dataFetch = await fetch(`https://pokeapi.co/api/v2/${obj}/${id}`)
            if(!dataFetch.ok){
                console.log("erro na busca");
                return;
            }

        }catch(e){
            console.log("Erro: " + e);
            return;
        }
        
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

// Auxiliary all-porpouse function
function capitalize(str){
    words = str.split("-");
    finalWord = ""
    words.forEach((word) => {finalWord += word.charAt(0).toUpperCase() + word.slice(1) + " ";})

    return finalWord;
}

// Main function
async function renderPokemon(id){
    let pokeDataFetch = await getObject("pokemon", id);
    let pokeSpeciesFetch = await getObject("pokemon-species", id);
    if(!pokeDataFetch || !pokeSpeciesFetch){ window.alert("Deu ruim aqui serjão"); return; }

    pokeData = pokeDataFetch;
    pokeSpeciesData = pokeSpeciesFetch;
    
    pokemonState = "front_default"
    sound = new Audio(pokeData.cries.latest)
    moveOffset = 0;

    // Pokemon Image
    renderImage();

    // Locking/unlocking buttons on image div
    changeButtonsAvailability()

    // PokeInfo div
    document.getElementById("pokeName").innerHTML = capitalize(pokeData.name);
    document.getElementById("pokeNumber").innerHTML = "No° " + pokeData.id;

    // Pokémon description
    let desc = await findFirstEnglishEntry(pokeSpeciesData.flavor_text_entries)
    document.getElementById("pokeDesc").innerHTML = await desc.flavor_text.replace("\f", " ").replace("\n", " ")

    // Type and miscelaneous badges
    renderTypeBadges();

    // Abilities
    renderAbilities();

    // Stats
    renderStats();

    // Moveset
    renderMoveset();

    // Weaknesses
    renderWeaknesses();

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

async function renderTypeBadges(){
    let types = pokeData.types
    if(types.length == 1){
        document.getElementById("badges").innerHTML = `
        <img
        src='./assets/types/${types[0].type.name}.png'
        onmouseenter="tooltip(event, 0)"
        onmouseout="hideTooltip()">`
    }else{
        document.getElementById("badges").innerHTML = `
        <img
        src='./assets/types/${types[0].type.name}.png'
        onmouseenter="tooltip(event, 0)"
        onmouseout="hideTooltip()">
        <img
        src='./assets/types/${types[1].type.name}.png'
        onmouseenter="tooltip(event, 1)"
        onmouseout="hideTooltip()">`
    }

    if(pokeSpeciesData.is_legendary){
        document.getElementById("badges").innerHTML += `
        <img 
        src='./assets/icons/legendary.png'
        onmouseenter="tooltip(event, 2)"
        onmouseout="hideTooltip()">`
    }

    if(pokeSpeciesData.is_mythical){
        document.getElementById("badges").innerHTML += `
        <img 
        src='./assets/icons/mythical.png'
        onmouseenter="tooltip(event, 3)"
        onmouseout="hideTooltip()">`
    }

    if(pokeSpeciesData.is_baby){
        document.getElementById("badges").innerHTML += `
        <img 
        src='./assets/icons/baby.png'
        onmouseenter="tooltip(event, 4)"
        onmouseout="hideTooltip()">`
    }

    if(pokeSpeciesData.has_gender_differences){
        document.getElementById("badges").innerHTML += `
        <img 
        src='./assets/icons/gender_difference.png'
        onmouseenter="tooltip(event, 5)"
        onmouseout="hideTooltip()">`
    }
}

async function renderAbilities(){
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
}

async function renderImage(){
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

async function renderStats(){
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
    renderImage()
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

// Tooltip, misc is for showing a move's type
function tooltip(e, whatToShow, misc = ""){
    let tooltip = document.getElementById("tooltip")

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
        case 10:
            tooltip.innerHTML = `<b><i>${capitalize(misc)}</i></b>`;
            break;
        }

        // Get where to put the tooltip, calculate it and move tooltip to it
        let targetArea = e.currentTarget.getBoundingClientRect();
        let tooltipArea = tooltip.getBoundingClientRect();

        let left = targetArea.left + targetArea.width / 2 - tooltipArea.width/2;
        let top = targetArea.bottom + 10

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;

    tooltip.classList.remove("opacity");
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

async function renderWeaknesses(){
    
    // Finding cached or API fetched type 1
    type1 = await getObject("type", pokeData.types[0].type.name);
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
    let movesDiv = document.getElementById("moves");
    movesDiv.innerHTML = "";
    
    
    let event = movesDiv.addEventListener("scroll", () => {
        if(movesDiv.scrollHeight - movesDiv.scrollTop == movesDiv.clientHeight){
            loadMoves();
        }
    })
    loadMoves(event);

}

async function loadMoves(event) {
    let moves = await pokeData.moves;
    let movesDiv = document.getElementById("moves");
    let i;
    for(i = moveOffset; i < moveOffset+20; i++){
        if(i == moves.length){
            moveOffset = i;
            return;
        }
        
        let move = moves[i].move.name;
        movesDiv.innerHTML += `
        <details data-number=${i} onclick ="renderMove('${move}')" class="move" id = "${move}">
            <summary><h3>${capitalize(move).replace("-", " ")}</h3></summary>
            <div class="moveContent">
                <div class="moveArchetype">
                    <img src="assets/types/unknown.png">
                    <b>Physical</b>
                </div>
                <hr>
                <div class="moveStats">
                    <span class="moveStat">Pow: --</span>
                    <span class="moveStat">Acc: --</span>
                    <span class="moveStat">PP : --</span>
                </div>
                <hr>
                <div class="moveMisc">
                    <span class="learnMethod">Learned Via <br><b>???</b></span>
                    <div>
                        Type: <img class="moveType" src="assets/types/no_type.png">
                    </div>
                </div>
            </div>
            <div class="moveDesc">Attack description</div>
        </details>`
    }
    moveOffset+=20;
}

async function renderMove(moveID){
    let moveDiv = document.getElementById(moveID)
    if(moveDiv.classList.contains("rendered")) return;

    moveDiv.classList.add("rendered");
    let move = await getObject("move", moveID);

    // Archetype image
    moveDiv.getElementsByClassName("moveArchetype")[0].children[0].src = `./assets/moveArchetypes/${move.damage_class.name}.png`
    moveDiv.getElementsByClassName("moveArchetype")[0].children[1].innerHTML = capitalize(move.damage_class.name)

    // Move Stats
    let pow = move.power;
    if(pow == undefined) pow = "--";

    let acc = move.accuracy;
    if(acc == undefined) acc = "--";
    
    let pp = move.pp;
    if(pp == undefined) pp = "--";

    moveDiv.getElementsByClassName("moveStats")[0].children[0].innerHTML = "Pow:  " + pow;
    moveDiv.getElementsByClassName("moveStats")[0].children[1].innerHTML = "Acc:  " + acc;
    moveDiv.getElementsByClassName("moveStats")[0].children[2].innerHTML = "PP :  " + pp;

    // Misc stats
    let learnMethod = pokeData.moves[moveDiv.dataset.number].version_group_details[0].move_learn_method.name;
    moveDiv.getElementsByClassName("learnMethod")[0].innerHTML = `Learned Via <br><b>${capitalize(learnMethod).replace("-", " ")}</b>`;

    let moveType = move.type.name;
    moveDiv.getElementsByClassName("moveType")[0].src = `./assets/types/${moveType}.png`
    moveDiv.getElementsByClassName("moveType")[0].onmouseenter = () => tooltip(event, 10, moveType);
    moveDiv.getElementsByClassName("moveType")[0].onmouseout = () => hideTooltip();

    // Move description
    let moveDesc = await findFirstEnglishEntry(move.flavor_text_entries);
    moveDiv.getElementsByClassName("moveDesc")[0].innerHTML = moveDesc.flavor_text;
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
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${imgID}.png" onerror='this.src="./assets/types/unknown.png"'>
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

renderPokemon(723);
// renderPokemon(Math.floor(Math.random()*1025) + 1);