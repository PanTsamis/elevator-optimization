// ΒΑΛΕ ΤΟ ΔΙΚΟ ΣΟΥ LINK ΕΔΩ
const API_URL = "https://cgi.di.uoa.gr/~sdi2500194/elevator/elevator_api.cgi";

let destinations = [];

function addPerson() {
    const input = document.getElementById('newDest');
    const val = parseInt(input.value);
    const maxFloors = parseInt(document.getElementById('maxFloors').value);

    if (isNaN(val) || val < 0) return;
    if (val > maxFloors) {
        alert(`Floor cannot be higher than ${maxFloors}`);
        return;
    }

    destinations.push(val);
    input.value = '';
    renderTags();
}

function generateRandom() {
    const max = parseInt(document.getElementById('maxFloors').value);
    for(let i=0; i<5; i++) {
        destinations.push(Math.floor(Math.random() * (max + 1)));
    }
    renderTags();
}

function removePerson(index) {
    destinations.splice(index, 1);
    renderTags();
}

function renderTags() {
    const container = document.getElementById('dest-list');
    const count = document.getElementById('peopleCount');
    container.innerHTML = '';
    
    destinations.forEach((dest, i) => {
        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.innerHTML = `Floor ${dest} <span onclick="removePerson(${i})">×</span>`;
        container.appendChild(tag);
    });
    count.innerText = destinations.length;
}

async function solve() {
    const btn = document.getElementById('solveBtn');
    const resArea = document.getElementById('results-area');
    const numStops = document.getElementById('numStops').value;
    const mode = document.getElementById('algoMode').value;
    const maxFloors = parseInt(document.getElementById('maxFloors').value);

    if (destinations.length === 0) {
        alert("Please add at least one person!");
        return;
    }

    btn.disabled = true;
    btn.innerText = "Calculating...";
    resArea.classList.add('hidden');

    const payload = {
        numPeople: destinations.length,
        numStops: parseInt(numStops),
        dests: destinations,
        mode: mode
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.error) {
            alert("Error: " + data.error);
        } else {
            displayResults(data, maxFloors);
        }

    } catch (e) {
        console.error(e);
        alert("Network Error or Server Timeout");
    } finally {
        btn.disabled = false;
        btn.innerText = "Calculate Optimal Stops";
    }
}

function displayResults(data, maxFloors) {
    const resArea = document.getElementById('results-area');
    document.getElementById('res-stops').innerText = data.stops.join(", ") || "None";
    document.getElementById('res-cost').innerText = data.cost;
    document.getElementById('res-mode').innerText = data.mode.toUpperCase();
    
    // Visualization
    const viz = document.getElementById('visualizer');
    viz.innerHTML = '';

    // Create floors (0 to max)
    for (let f = 0; f <= maxFloors; f++) {
        const div = document.createElement('div');
        div.className = 'floor';
        if (data.stops.includes(f)) div.classList.add('stop');

        // Add label
        const label = document.createElement('span');
        label.className = 'floor-label';
        label.innerText = f;
        div.appendChild(label);

        // Add dots for people wanting to go here
        const peopleHere = destinations.filter(d => d === f).length;
        for(let i=0; i<peopleHere; i++) {
            const dot = document.createElement('div');
            dot.className = 'person-dot';
            div.appendChild(dot);
        }

        viz.appendChild(div);
    }

    resArea.classList.remove('hidden');
}