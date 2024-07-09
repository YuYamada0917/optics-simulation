const simulation = new WaveSimulation('waveCanvas');
const clearButton = document.getElementById('clearButton');
const sourceCountElement = document.getElementById('sourceCount');
const sourceList = document.getElementById('sourceList');
const toggleSimulationButton = document.getElementById('toggleSimulationButton');
const toggleModeButton = document.getElementById('toggleModeButton');

let isRulerMode = false;
let isSettingRulerEnd = false;

function updateSourceCount() {
    sourceCountElement.textContent = simulation.waveSources.length;
}

function createWavePicker(source, index) {
    const pickerDiv = document.createElement('div');
    pickerDiv.className = 'wave-picker';
    
    const handle = document.createElement('div');
    handle.className = 'wave-picker-handle';
    pickerDiv.appendChild(handle);

    const updatePickerPosition = () => {
        const x = (source.wavelength - 5) / 45 * 100;
        const y = (source.phase / (2 * Math.PI)) * 100;
        handle.style.left = `${x}%`;
        handle.style.top = `${y}%`;
    };

    updatePickerPosition();

    let isDragging = false;

    pickerDiv.addEventListener('mousedown', () => {
        isDragging = true;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const rect = pickerDiv.getBoundingClientRect();
            let x = (e.clientX - rect.left) / rect.width;
            let y = (e.clientY - rect.top) / rect.height;
            x = Math.max(0, Math.min(1, x));
            y = Math.max(0, Math.min(1, y));

            const wavelength = 5 + x * 45;
            const phase = y * 2 * Math.PI;

            simulation.updateSource(index, wavelength, phase);
            updatePickerPosition();
            updateWaveInfo(index);
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    return pickerDiv;
}

function updateWaveInfo(index) {
    const wavelengthInput = document.getElementById(`wavelength-${index}`);
    const phaseInput = document.getElementById(`phase-${index}`);
    const source = simulation.waveSources[index];
    wavelengthInput.value = source.wavelength.toFixed(2);
    phaseInput.value = (source.phase / Math.PI).toFixed(2);
}

function updateSourceList() {
    sourceList.innerHTML = '';
    simulation.waveSources.forEach((source, index) => {
        const sourceDiv = document.createElement('div');
        sourceDiv.className = 'source-control';
        sourceDiv.innerHTML = `
            <div>波源 ${index + 1}</div>
            <div class="input-group">
                <label>波長: <input type="number" id="wavelength-${index}" min="5" max="50" step="0.1"></label>
                <label>位相: <input type="number" id="phase-${index}" min="0" max="2" step="0.1"></label>
            </div>
            <button onclick="removeSource(${index})">削除</button>
            <button onclick="activateRuler(${index})">距離測定</button>
        `;
        const wavePicker = createWavePicker(source, index);
        sourceDiv.insertBefore(wavePicker, sourceDiv.lastElementChild);
        sourceList.appendChild(sourceDiv);
        updateWaveInfo(index);

        document.getElementById(`wavelength-${index}`).addEventListener('change', (e) => {
            const wavelength = Number(e.target.value);
            simulation.updateSource(index, wavelength, source.phase);
            updateWaveInfo(index);
        });

        document.getElementById(`phase-${index}`).addEventListener('change', (e) => {
            const phase = Number(e.target.value) * Math.PI;
            simulation.updateSource(index, source.wavelength, phase);
            updateWaveInfo(index);
        });
    });
}

function removeSource(index) {
    simulation.removeSource(index);
    updateSourceCount();
    updateSourceList();
}

function activateRuler() {
    isRulerMode = true;
    simulation.canvas.style.cursor = 'crosshair';
}

simulation.canvas.addEventListener('click', (event) => {
    const rect = simulation.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (isRulerMode) {
        if (!isSettingRulerEnd) {
            simulation.setRulerStart(x, y);
            isSettingRulerEnd = true;
        } else {
            simulation.setRulerEnd(x, y);
            isRulerMode = false;
            isSettingRulerEnd = false;
            simulation.canvas.style.cursor = 'default';
        }
    } else {
        simulation.addSource(x, y);
        updateSourceCount();
        updateSourceList();
    }
});

simulation.canvas.addEventListener('mousemove', (event) => {
    if (isSettingRulerEnd) {
        const rect = simulation.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        simulation.updateRulerEnd(x, y);
    }
});

clearButton.addEventListener('click', () => {
    simulation.clearSources();
    simulation.clearRuler();
    isRulerMode = false;
    isSettingRulerEnd = false;
    updateSourceCount();
    updateSourceList();
});

toggleSimulationButton.addEventListener('click', () => {
    simulation.toggleSimulation();
    toggleSimulationButton.textContent = simulation.isRunning ? '時間停止' : '時間再開';
});

toggleModeButton.addEventListener('click', () => {
    simulation.toggleInterferenceMode();
    toggleModeButton.textContent = simulation.showInterference ? '通常モード' : '干渉モード';
});

function resizeCanvas() {
    const canvas = document.getElementById('waveCanvas');
    const container = document.querySelector('.container');
    const containerWidth = container.clientWidth;
    const aspectRatio = 3 / 4;
    
    canvas.width = Math.min(containerWidth - 40, 800);
    canvas.height = canvas.width * aspectRatio;
    
    simulation.width = canvas.width;
    simulation.height = canvas.height;
}

window.addEventListener('resize', resizeCanvas);

resizeCanvas();
simulation.animate();
updateSourceList();