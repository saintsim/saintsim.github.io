function setElementTextColour(id, data) {
    const currentElement = document.getElementById(id);
    if (currentElement) {
        currentElement.style.color = data;
    }
}
const activeColour = '#ffffff';
const inactiveColour = '#4E78A5';
// In the order setOutfitColour takes their colours.
const OUTFIT_ELEMENT_IDS = ["outfit-shorts", "outfit-trousers", "outfit-jumper", "outfit-light-jacket",
    "outfit-big-coat", "outfit-scarf", "outfit-hat-gloves", "outfit-umbrella"];
function setOutfitColour(...colours) {
    OUTFIT_ELEMENT_IDS.forEach((id, index) => setElementTextColour(id, colours[index]));
}
export function updateOutfitOptions(minTemeperature, chanceOfRainPerc) {
    var outfitShorts = inactiveColour;
    var outfitTrousers = inactiveColour;
    var outfitJumper = inactiveColour;
    var outfitLightJacket = inactiveColour;
    var outfitBigCoat = inactiveColour;
    var outfitScarf = inactiveColour;
    var outfitHatGloves = inactiveColour;
    var outfitUmbrella = inactiveColour;
    if (minTemeperature < 1) {
        outfitTrousers = activeColour;
        outfitJumper = activeColour;
        outfitBigCoat = activeColour;
        outfitScarf = activeColour;
        outfitHatGloves = activeColour;
    }
    else if (minTemeperature < 6) {
        outfitTrousers = activeColour;
        outfitJumper = activeColour;
        outfitBigCoat = activeColour;
        outfitScarf = activeColour;
    }
    else if (minTemeperature < 11) {
        outfitTrousers = activeColour;
        outfitJumper = activeColour;
        outfitBigCoat = activeColour;
        outfitScarf = activeColour;
    }
    else if (minTemeperature < 16) {
        outfitLightJacket = activeColour;
        outfitTrousers = activeColour;
        outfitJumper = activeColour;
    }
    else if (minTemeperature < 25) {
        outfitTrousers = activeColour;
    }
    else {
        outfitShorts = activeColour;
    }
    if (chanceOfRainPerc > 39) {
        outfitUmbrella = activeColour;
    }
    setOutfitColour(outfitShorts, outfitTrousers, outfitJumper, outfitLightJacket, outfitBigCoat, outfitScarf, outfitHatGloves, outfitUmbrella);
}
// Back to the page's initial look, with no outfit picked, for when no forecast is shown.
export function resetOutfitOptions() {
    OUTFIT_ELEMENT_IDS.forEach(id => setElementTextColour(id, ""));
}
