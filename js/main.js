async function getPokemonById(id){
    const apiFetch = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await apiFetch.json();
    console.log(data);

    const flavorTextFetch = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
    const flavorText = await flavorTextFetch.json();
    console.log(flavorText);

    // const abc = await fetch(`https://pokeapi.co/api/v2/characteristic/${id}`);
    // const abcData = await abc.json();
    // console.log(abcData)
    // Gives descriptive sentence
}

async function getMoveById(id){
    const apiFetch = await fetch(`https://pokeapi.co/api/v2/move/${id}`);
    const data = await apiFetch.json();
    console.log(data)
}


async function getAbilityById(id){
    const apiFetch = await fetch(`https://pokeapi.co/api/v2/ability/${id}`);
    const data = await apiFetch.json();
    console.log(data)
}

getPokemonById(2);