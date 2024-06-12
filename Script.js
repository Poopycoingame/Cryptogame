<script>
    let score = parseInt(localStorage.getItem('score')) || 0;
    let energy = parseInt(localStorage.getItem('energy')) || 5000;
    let walletAddress = localStorage.getItem('walletAddress') || '';

    let energyRegenLevel = parseInt(localStorage.getItem('energyRegenLevel')) || 0;
    let strengthLevel = parseInt(localStorage.getItem('strengthLevel')) || 0;
    let efficiencyLevel = parseInt(localStorage.getItem('efficiencyLevel')) || 0;

    const maxBoostLevel = 10;
    const maxBoostPercentage = 0.4;
    const boostCost = 100;

    function updateBoostLevels() {
        document.getElementById('energyRegenLevel').innerText = `${energyRegenLevel}/10`;
        document.getElementById('strengthLevel').innerText = `${strengthLevel}/10`;
        document.getElementById('efficiencyLevel').innerText = `${efficiencyLevel}/10`;
    }

    // Function to update energy
    function updateEnergy() {
        const lastEnergyUpdate = localStorage.getItem('lastEnergyUpdate');
        const now = Date.now();

        if (lastEnergyUpdate) {
            const timePassed = now - parseInt(lastEnergyUpdate, 10);
            const hoursPassed = Math.floor(timePassed / (1000 * 60 * 60));

            if (hoursPassed >= 2) {
                energy = 5000;
                localStorage.setItem('energy', energy);
                localStorage.setItem('lastEnergyUpdate', now.toString());
            } else {
                const regenMultiplier = 1 + (energyRegenLevel / maxBoostLevel) * maxBoostPercentage;
                energy = Math.min(5000, energy + hoursPassed * regenMultiplier);
                localStorage.setItem('energy', energy);
            }
        } else {
            localStorage.setItem('lastEnergyUpdate', now.toString());
        }

        document.getElementById('current-energy').innerText = Math.floor(energy);
    }

    // Click event for cookie
    document.getElementById('cookie').onclick = function(event) {
        if (energy > 0) {
            const strengthMultiplier = 1 + (strengthLevel / maxBoostLevel) * maxBoostPercentage;
            const efficiencyMultiplier = 1 + (efficiencyLevel / maxBoostLevel) * maxBoostPercentage;

            const scoreIncrease = Math.floor(1 * strengthMultiplier);
            const energyDecrease = 1 * efficiencyMultiplier;

            score += scoreIncrease;
            energy -= energyDecrease;
            document.getElementById('score').innerText = score;
            document.getElementById('current-energy').innerText = Math.floor(energy);
            localStorage.setItem('score', score);
            localStorage.setItem('energy', energy);

            // Get the coordinates of the click event
            const clickX = event.clientX;
            const clickY = event.clientY;

            // Create a score animation element
            const scoreAnimation = document.createElement('div');
            scoreAnimation.classList.add('score-animation'); // Add the class for styling
            scoreAnimation.innerText = `+${scoreIncrease}`;
            scoreAnimation.classList.add('bold'); // Add class for making it bold
            scoreAnimation.classList.add('white'); // Add class for changing color to white

            // Set the position of the animation element to the click coordinates
            scoreAnimation.style.position = 'absolute'; // Ensure it's positioned absolutely
            scoreAnimation.style.left = clickX + 'px';
            scoreAnimation.style.top = clickY + 'px';

            // Append the animation element to the container
            document.getElementById('score-animation-container').appendChild(scoreAnimation);

            // Remove the animation element after the animation completes
            setTimeout(() => {
                scoreAnimation.remove();
            }, 1000);

            // Bounce animation for score
            document.getElementById('score').style.animation = 'bounce 0.5s';
            setTimeout(() => {
                document.getElementById('score').style.animation = '';
            }, 500);
        } else {
            alert('Out of energy! Please wait for it to recharge.');
        }
    };

    // Click event for login button
    document.getElementById('loginButton').onclick = function() {
        const wallet = document.getElementById('wallet').value;
        if (!wallet) {
            alert('Please enter your TON wallet address');
            return;
        }
        walletAddress = wallet;
        localStorage.setItem('walletAddress', walletAddress);
        alert('Login successful');
    };

    // Click event for payout button
    document.getElementById('payoutButton').onclick = function() {
        if (!walletAddress) {
            alert('Please login with your TON wallet address');
            return;
        }

        fetch('/payout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ score: score, wallet: walletAddress })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Payout successful!');
                score = 0;
                document.getElementById('score').innerText = score;
                localStorage.setItem('score', score);
            } else {
                alert('Payout failed: ' + data.message);
            }
        });
    };

    // Click event for settings icon
    document.getElementById('settingsIcon').onclick = function() {
        const payoutBox = document.getElementById('payoutBox');
        if (payoutBox.style.display === 'none' || payoutBox.style.display === '') {
            payoutBox.style.display = 'flex';
        } else {
            payoutBox.style.display = 'none';
        }
    };

    // Click event for boost menu button
    document.getElementById('boostMenuButton').onclick = function() {
        const boostMenu = document.getElementById('boostMenu');
        if (boostMenu.style.display === 'none' || boostMenu.style.display === '') {
            boostMenu.style.display = 'flex';
        } else {
            boostMenu.style.display = 'none';
        }
    };

    // Click events for boost buttons
    document.getElementById('boostEnergyRegen').onclick = function() {
        if (energyRegenLevel < maxBoostLevel) {
            if (score >= boostCost) {
                score -= boostCost;
                energyRegenLevel++;
                localStorage.setItem('score', score);
                localStorage.setItem('energyRegenLevel', energyRegenLevel);
                updateBoostLevels();
                document.getElementById('score').innerText = score;
            } else {
                alert('Not enough score to buy this boost');
            }
        } else {
            alert('Energy Regen boost is at max level');
        }
    };

    document.getElementById('boostStrength').onclick = function() {
        if (strengthLevel < maxBoostLevel) {
            if (score >= boostCost) {
                score -= boostCost;
                strengthLevel++;
                localStorage.setItem('score', score);
                localStorage.setItem('strengthLevel', strengthLevel);
                updateBoostLevels();
                document.getElementById('score').innerText = score;
            } else {
                alert('Not enough score to buy this boost');
            }
        } else {
            alert('Strength boost is at max level');
        }
    };

    document.getElementById('boostEfficiency').onclick = function() {
        if (efficiencyLevel < maxBoostLevel) {
            if (score >= boostCost) {
                score -= boostCost;
                efficiencyLevel++;
                localStorage.setItem('score', score);
                localStorage.setItem('efficiencyLevel', efficiencyLevel);
                updateBoostLevels();
                document.getElementById('score').innerText = score;
            } else {
                alert('Not enough score to buy this boost');
            }
        } else {
            alert('Efficiency boost is at max level');
        }
    };

    // Initialize score and update energy on page load
    window.onload = function() {
        document.getElementById('score').innerText = score;
        updateBoostLevels();
        updateEnergy();
        setInterval(updateEnergy, 1000 * 60 * 60); // Check energy recharge every hour
    };
</script>
