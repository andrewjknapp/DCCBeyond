let CHARACTER_SHEET_CONTAINER;
let FILE_UPLOAD;

let numCharacters = 0
let isFileLoaded = false;

const characterTemplate = (characterObject, id) => {
    return `
        <article id="${id}" class="character-sheet">
            <input type="text" name="${id}_name" class="character-name" value="${characterObject.details.name}"/>
            <input type="button" value="X" class="character-delete-button" onclick="deleteCharacter(${id})"/>

            <input type="text" name="${id}_ac" class="ac" value="${characterObject.other.ac}"/>
            <input type="text" name="${id}_hp" class="hp" value="${characterObject.other.hp}"/>
            <input type="text" name="${id}_hp_max" class="hp-max" value="${characterObject.other.maxHp}"/>
            <input type="text" name="${id}_occupation" class="occupation" value="${characterObject.details.occupation}"/>
            <input type="checkbox" name="${id}_law" class="alignment law" ${characterObject.details.alignment === 'L' ? 'checked' : ''}/>
            <input type="checkbox" name="${id}_neutral" class="alignment neutral" ${characterObject.details.alignment === 'N' ? 'checked' : ''}/>
            <input type="checkbox" name="${id}_chaos" class="alignment chaos" ${characterObject.details.alignment === 'C' ? 'checked' : ''}/>

            <section class="ability-scores">
                <input type="text" name="${id}_ability_strength" class="strength-a" value="${characterObject.abilities.strength}"/>
                <input type="text" name="${id}_modifier_strength" class="strength-m" value="${characterObject.modifiers.strength}"/>

                <input type="text" name="${id}_ability_agility" class="agility-a" value="${characterObject.abilities.agility}"/>
                <input type="text" name="${id}_modifier_agility" class="agility-m" value="${characterObject.modifiers.agility}"/>

                <input type="text" name="${id}_ability_stamina" class="stamina-a" value="${characterObject.abilities.stamina}"/>
                <input type="text" name="${id}_modifier_stamina" class="stamina-m" value="${characterObject.modifiers.stamina}"/>
                
                <input type="text" name="${id}_ability_personality" class="personality-a" value="${characterObject.abilities.personality}"/>
                <input type="text" name="${id}_modifier_personality" class="personality-m" value="${characterObject.modifiers.personality}"/>
                
                <input type="text" name="${id}_ability_intelligence" class="intelligence-a" value="${characterObject.abilities.intelligence}"/>
                <input type="text" name="${id}_modifier_intelligence" class="intelligence-m" value="${characterObject.modifiers.intelligence}"/>
                
                <input type="text" name="${id}_ability_luck" class="luck-a" value="${characterObject.abilities.luck}"/>
                <input type="text" name="${id}_modifier_luck" class="luck-m" value="${characterObject.modifiers.luck}"/>
            </section>

            <section class="saves">
                <input type="text" name="${id}_reflex" class="reflex" value="${characterObject.saves.reflex}"/>
                <input type="text" name="${id}_fortitude" class="fortitude" value="${characterObject.saves.fortitude}"/>
                <input type="text" name="${id}_will" class="will" value="${characterObject.saves.will}"/>
            </section>

            <input type="text" name="${id}_speed" class="speed" value="${characterObject.other.speed}"/>
            <input type="text" name="${id}_init" class="init" value="${characterObject.other.init}"/>

            <section class="weapons">
                <input type="text" name="${id}_weapon_1" class="weapon-1" value="${characterObject.weapons[0] || ''}"/>
                <input type="text" name="${id}_weapon_2" class="weapon-2" value="${characterObject.weapons[1] || ''}"/>
                <input type="text" name="${id}_weapon_3" class="weapon-3" value="${characterObject.weapons[2] || ''}"/>
            </section>

            <section class="text-boxes">
                <textarea name="${id}_notes" class="notes">${characterObject.notes}</textarea>
                <textarea name="${id}_equipment" class="equipment">${characterObject.equipment}</textarea>
                <input type="text" name="${id}_xp" class="xp" value="${characterObject.xp}"/>
            </section>
        </article>
    `
}

function deleteCharacter(id) {

    if (!confirm("Delete character?")) return

    const sheetToDelete = document.getElementById(id)

    sheetToDelete.remove()
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

const formatCharacterData = (characterObject, source, prefix) => {

    const co = {...characterObject}
    // new character
    const nc = {...internalSchema}

    if (source === 'form') {
        nc.details =  {
            name: co[`${prefix}_name`],
            occupation: co[`${prefix}_occupation`],
            alignment: '', // L, N, C
        }
    
        nc.abilities = {
            strength: co[`${prefix}_ability_strength`],
            agility: co[`${prefix}_ability_agility`],
            stamina: co[`${prefix}_ability_stamina`],
            personality: co[`${prefix}_ability_personality`],
            intelligence: co[`${prefix}_ability_intelligence`],
            luck: co[`${prefix}_ability_luck`],
        }
    
        nc.modifiers = {
            strength: co[`${prefix}_modifier_strength`],
            agility: co[`${prefix}_modifier_agility`],
            stamina: co[`${prefix}_modifier_stamina`],
            personality: co[`${prefix}_modifier_personality`],
            intelligence: co[`${prefix}_modifier_intelligence`],
            luck: co[`${prefix}_modifier_luck`],
        }
    
        nc.saves = {
            reflex: co[`${prefix}_reflex`],
            fortitude: co[`${prefix}_fortitude`],
            will: co[`${prefix}_will`],
        }
    
        nc.other = {
            speed: co[`${prefix}_speed`],
            init: co[`${prefix}_init`],
            hp: co[`${prefix}_hp`],
            maxHp: co[`${prefix}_hp_max`],
            ac: co[`${prefix}_ac`],
        }
    
        nc.weapons = [
            co[`${prefix}_weapon_1`],
            co[`${prefix}_weapon_2`],
            co[`${prefix}_weapon_3`]
        ],
    
        nc.equipment = co[`${prefix}_equipment`]
        nc.notes = co[`${prefix}_notes`],
        nc.xp = co[`${prefix}_xp`],
        nc.internalSchema = true

        return nc
    }

    if ("internalSchema" in co) {
        return co
    }

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
    let generatedHTML = "";
    numCharacters = 0
    for (let i = 0; i < characterData.length; i++) {
        numCharacters++
        generatedHTML += characterTemplate(characterData[i], i)

    }

    CHARACTER_SHEET_CONTAINER.innerHTML += generatedHTML
    isFileLoaded = true
}

const importJSONData = (data) => {

    try {
        data = JSON.parse(data)
    } catch (e) {
        // return false;
    }

    const formattedCharacters = data.characters.map(character => formatCharacterData(character))
 
    updateScreen(formattedCharacters)
}

function handleSheetSubmit(e) {
    e.preventDefault()
    if (!CHARACTER_SHEET_CONTAINER.innerHTML) {
        alert("No sheets to save")
        return
    }

    const data = new FormData(e.target);

    const characterFormData = Object.fromEntries(data);

    const formattedData = {
        characters: []
    }

    for (let i = 0; i < numCharacters; i++) {
        if (characterFormData[`${i}_name`] == undefined) {
            console.log('Not there')
            continue
        }
        formattedData.characters.push(formatCharacterData(characterFormData, 'form', i))
    }

    const jsonDataToSave = JSON.stringify(formattedData)

    downloadObjectAsJson(jsonDataToSave, characterFormData.filename || 'dcc_character_sheet')
}

function downloadObjectAsJson(exportObj, exportName){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

const handleClearSheets = () => {
    if (!confirm("Delete character sheets? If you would like to save your work choose cancel then use the save button.")) {
        return
    }

    CHARACTER_SHEET_CONTAINER.innerHTML = '';
    numCharacters = 0
    isFileLoaded = false;
}

const addCharacter = () => {
    CHARACTER_SHEET_CONTAINER.innerHTML += characterTemplate(internalSchema, numCharacters)
    numCharacters++
}

function main() {
    FILE_UPLOAD = document.getElementById("file-upload")
    FILE_UPLOAD.addEventListener("change", handleFileUpload, true);

    CHARACTER_SHEET_CONTAINER = document.getElementById("character-sheet-container");

    let form = document.getElementById("character-sheet-container")
    form.addEventListener("submit", (e) => handleSheetSubmit(e, form), true);

    let clearButton = document.getElementById("clear-sheets-button")
    clearButton.addEventListener("click", handleClearSheets, true);

    let addCharacterButton = document.getElementById("add-character-button")
    addCharacterButton.addEventListener("click", addCharacter, true);

}

window.addEventListener('load', function () {
    main()
})

