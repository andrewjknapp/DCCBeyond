let CHARACTER_SHEET_CONTAINER;
let FILE_UPLOAD;

let numCharacters = 0
let isFileLoaded = false;

const characterTemplate = (characterObject, id) => {
    return `
        <article id="${id}" class="character-sheet">
            <input type="text" class="character-name" value="${characterObject.details.name}"/>
            <input type="text" class="ac" value="${characterObject.other.ac}"/>
            <input type="text" class="hp" value="${characterObject.other.hp}"/>
            <input type="text" class="hp-max" value="${characterObject.other.maxHp}"/>
            <input type="text" class="occupation" value="${characterObject.details.occupation}"/>
            <input type="checkbox" class="alignment law" ${characterObject.details.alignment === 'L' ? 'checked' : ''}/>
            <input type="checkbox" class="alignment neutral" ${characterObject.details.alignment === 'N' ? 'checked' : ''}/>
            <input type="checkbox" class="alignment chaos" ${characterObject.details.alignment === 'C' ? 'checked' : ''}/>

            <section class="ability-scores">
                <input type="text" class="strength-a" value="${characterObject.abilities.strength}"/>
                <input type="text" disabled class="strength-m" value="${characterObject.modifiers.strength}"/>

                <input type="text" class="agility-a" value="${characterObject.abilities.agility}"/>
                <input type="text" disabled class="agility-m" value="${characterObject.modifiers.agility}"/>

                <input type="text" class="stamina-a" value="${characterObject.abilities.stamina}"/>
                <input type="text" disabled class="stamina-m" value="${characterObject.modifiers.stamina}"/>
                
                <input type="text" class="personality-a" value="${characterObject.abilities.personality}"/>
                <input type="text" disabled class="personality-m" value="${characterObject.modifiers.personality}"/>
                
                <input type="text" class="intelligence-a" value="${characterObject.abilities.intelligence}"/>
                <input type="text" disabled class="intelligence-m" value="${characterObject.modifiers.intelligence}"/>
                
                <input type="text" class="luck-a" value="${characterObject.abilities.luck}"/>
                <input type="text" class="luck-m" value="${characterObject.modifiers.luck}"/>
            </section>

            <section class="saves">
                <input type="text" class="reflex" value="${characterObject.saves.reflex}"/>
                <input type="text" class="fortitude" value="${characterObject.saves.fortitude}"/>
                <input type="text" class="will" value="${characterObject.saves.will}"/>
            </section>

            <input type="text" class="speed" value="${characterObject.other.speed}"/>
            <input type="text" class="init" value="${characterObject.other.init}"/>

            <section class="weapons">
                <input type="text" class="weapon-1" value="${characterObject.weapons[0] || ''}"/>
                <input type="text" class="weapon-2" value="${characterObject.weapons[1] || ''}"/>
                <input type="text" class="weapon-3" value="${characterObject.weapons[2] || ''}"/>
            </section>

            <section class="text-boxes">
                <textarea class="notes">${characterObject.notes}</textarea>
                <textarea class="equipment">${characterObject.equipment}</textarea>
                <input type="text" class="xp" value="${characterObject.xp}"/>
            </section>
        </article>
    `
}

const inputSchema =  {
  'occTitle': 'Soldier',
  'strengthScore': '13',
  'strengthMod': '1',
  'agilityScore': '10',
  'agilityMod': '0',
  'staminaScore': '9',
  'staminaMod': '0',
  'personalityScore': '11',
  'personalityMod': '0',
  'intelligenceScore': '9',
  'intelligenceMod': '0',
  'luckScore': '14',
  'luckMod': '1',
  'armorClass': '11',
  'hitPoints': '5',
  'weapon': 'Spear',
  'attackMod': '1',
  'attackDamageMod': '1',
  'attackDamage': '1d8+1',
  'attackModMelee': '1',
  'attackDamageMelee': '1',
  'attackModRanged': '0',
  'attackDamageRanged': '0',
  'speed': '30',
  'initiative': '0',
  'saveReflex': '0',
  'saveFort': '0',
  'saveWill': '0',
  'equipment': 'Iron spike (1 sp)',
  'equipment2': '',
  'equipment3': 'Water skin',
  'tradeGood': 'Shield',
  'startingFunds': '40 cp',
  'luckySign': 'Bountiful harvest (Hit points, applies each level) (+1)',
  'languages': 'Common',
  'racialTraits': ''
}

const internalSchema = {
    details: {
        name: '',
        occupation: '',
        alignment: '', // L, N, C
    },
    abilities: {
        strength: '',
        agility: '',
        stamina: '',
        personality: '',
        intelligence: '',
        luck: '',        
    },
    modifiers: {
        strength: '',
        agility: '',
        stamina: '',
        personality: '',
        intelligence: '',
        luck: '',        
    },
    saves: {
        reflex: '',
        fortitude: '',
        will: ''
    },
    other: {
        speed: '',
        init: '',
        hp: '',
        maxHp: '',
        ac: ''
    },
    weapons: [
        ''
    ],
    equipment: '',
    notes: '',
    xp: '',
    internalSchema: true
}

const negPos = (num) => {
    const number = Number(num)

    if (number < 0) {
        return `-${number}`
    } else if (number > 0) {
        return `+${number}`
    } else {
        return number
    }
} 

const formatCharacterData = (characterObject) => {

    const co = {...characterObject}

    if ("internalSchema" in co) {
        return co
    }

    // new character
    const nc = {...internalSchema}

    nc.details =  {
        name: '',
        occupation: co.occTitle,
        alignment: '', // L, N, C
    }

    nc.abilities = {
        strength: co.strengthScore,
        agility: co.agilityScore,
        stamina: co.staminaScore,
        personality: co.personalityScore,
        intelligence: co.intelligenceScore,
        luck: co.luckScore,        
    }

    nc.modifiers = {
        strength: co.strengthMod,
        agility: co.agilityMod,
        stamina: co.staminaMod,
        personality: co.personalityMod,
        intelligence: co.intelligenceMod,
        luck: co.luckMod,        
    }

    nc.saves = {
        reflex: co.saveReflex,
        fortitude: co.saveFort,
        will: co.saveWill
    }

    nc.other = {
        speed: co.speed,
        init: co.initiative,
        hp: co.hitPoints,
        maxHp: co.hitPoints,
        ac: co.armorClass
    }

    nc.weapons = [
        `${co.weapon} ${co.attackDamage}`
    ],

    nc.equipment = `${co.equipment}\n${co.equipment2}\n${co.equipment3}`,
    nc.notes = `Lucky Sign: ${co.luckySign}\nLanguages: ${co.languages}${co.racialTraits && `\nRacial Trait: ${co.racialTraits}` }`,
    nc.xp = 0,
    nc.internalSchema = true

    return nc
}

const handleFileUpload = (e) => {
    e.preventDefault()

    if (isFileLoaded) {
        if (!confirm("There is a file currently active, do you want to upload a new file and discard the current one?")) {
            return
        }
    }
    
    if(FILE_UPLOAD.files.length)
    {
        var reader = new FileReader();

        reader.onload = function(e)
        {
            importJSONData(JSON.parse(e.target.result))
        };

        reader.readAsBinaryString(FILE_UPLOAD.files[0]);
    }
}

const updateScreen = (characterData) => {
    const maxCharacters = 6
    let generatedHTML = "";
    for (let i = 0; i < characterData.length; i++) {
        if (i === maxCharacters) {
            break;
        }
        numCharacters++
        generatedHTML += characterTemplate(characterData[i], i)

    }

    CHARACTER_SHEET_CONTAINER.innerHTML = generatedHTML
    isFileLoaded = true
}

const importJSONData = (data) => {

    const formattedCharacters = data.characters.map(character => formatCharacterData(character))
 
    updateScreen(formattedCharacters)
}

const getCharacterInfo = (id) => {
    const SHEET = document.getElementById(id)

    console.log(SHEET)
}

const handleSave = (e) => {
    e.preventDefault()
    console.log(numCharacters)

    for (let i = 0; i < numCharacters; i++) {
        getCharacterInfo(i)

        break;
    }


}

function handleSheetSubmit(e, form) {
    e.preventDefault()
    const data = new FormData(form);
    console.log(data)
}

function main() {
    FILE_UPLOAD = document.getElementById("file-upload")
    FILE_UPLOAD.addEventListener("change", handleFileUpload, true);

    var SAVE_BUTTON = document.getElementById("save-button")
    SAVE_BUTTON.addEventListener("click", handleSave, true);

    CHARACTER_SHEET_CONTAINER = document.getElementById("character-sheet-container");

    form = document.getElementById("sheet-0")
    form.addEventListener("submit", (e) => handleSheetSubmit(e, form), true);

}

window.addEventListener('load', function () {
    main()
  })

