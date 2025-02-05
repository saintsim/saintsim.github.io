function setElementTextColour(id, data) {
    const currentElement = document.getElementById(id);
    if (currentElement) {
        currentElement.style.color = data;
    }
}
const activeColour = '#ffffff';
const inactiveColour = '#4E78A5';
function setOutfitColour(outfitShorts, outfitTrousers, outfitJumper, outfitLightJacket, outfitBigCoat, outfitScarf, outfitHatGloves, outfitUmbrella) {
    setElementTextColour("outfit-shorts", outfitShorts);
    setElementTextColour("outfit-trousers", outfitTrousers);
    setElementTextColour("outfit-jumper", outfitJumper);
    setElementTextColour("outfit-light-jacket", outfitLightJacket);
    setElementTextColour("outfit-big-coat", outfitBigCoat);
    setElementTextColour("outfit-scarf", outfitScarf);
    setElementTextColour("outfit-hat-gloves", outfitHatGloves);
    setElementTextColour("outfit-umbrella", outfitUmbrella);
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
    }
    else if (minTemeperature < 11) {
        outfitTrousers = activeColour;
        outfitJumper = activeColour;
        outfitLightJacket = activeColour;
    }
    else if (minTemeperature < 16) {
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
