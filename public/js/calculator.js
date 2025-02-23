document.getElementById("calculate-btn").addEventListener("click", function() {
    const flourWeight = parseFloat(document.getElementById("flour-weight").value);
    const waterPercentage = parseFloat(document.getElementById("water-percentage").value);
    const milkPercentage = parseFloat(document.getElementById("milk-percentage").value);
    const yeastPercentage = parseFloat(document.getElementById("yeast-percentage").value);
    const saltPercentage = parseFloat(document.getElementById("salt-percentage").value);
    // walidacja
    if (isNaN(flourWeight) || flourWeight <= 0 || 
        isNaN(waterPercentage) || waterPercentage < 0 || 
        isNaN(milkPercentage) || milkPercentage < 0 || 
        isNaN(yeastPercentage) || yeastPercentage < 0 || 
        isNaN(saltPercentage) || saltPercentage < 0) {
        alert("All values should be non nil");
        return;
    }

    const waterWeight = (waterPercentage / 100) * flourWeight;
    const milkWeight = (milkPercentage / 100) * flourWeight;
    const yeastWeight = (yeastPercentage / 100) * flourWeight;
    const saltWeight = (saltPercentage / 100) * flourWeight;

    const totalDoughWeight = flourWeight + waterWeight + milkWeight + yeastWeight + saltWeight;

    document.getElementById("flour-weight-result").textContent = flourWeight.toFixed(2);
    document.getElementById("water-weight-result").textContent = waterWeight.toFixed(2);
    document.getElementById("milk-weight-result").textContent = milkWeight.toFixed(2);
    document.getElementById("yeast-weight-result").textContent = yeastWeight.toFixed(2);
    document.getElementById("salt-weight-result").textContent = saltWeight.toFixed(2);

    document.getElementById("dough-weight").textContent = totalDoughWeight.toFixed(2);
});
