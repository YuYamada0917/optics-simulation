const simulation = new WaveSimulation('waveCanvas');
const clearButton = document.getElementById('clearButton');
const sourceCountElement = document.getElementById('sourceCount');
const sourceList = document.getElementById('sourceList');

let isRulerMode = false;
let selectedSourceIndex = -1;

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

        // 数値入力のイベントリスナーを追加
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

function activateRuler(index) {
    isRulerMode = true;
    selectedSourceIndex = index;
    simulation.canvas.style.cursor = 'crosshair';
}

simulation.canvas.addEventListener('click', (event) => {
    const rect = simulation.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (isRulerMode) {
        simulation.setRuler(selectedSourceIndex, x, y);
        isRulerMode = false;
        selectedSourceIndex = -1;
        simulation.canvas.style.cursor = 'default';
    } else {
        simulation.addSource(x, y);
        updateSourceCount();
        updateSourceList();
    }
});

simulation.canvas.addEventListener('mousemove', (event) => {
    if (isRulerMode) {
        const rect = simulation.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        simulation.setRuler(selectedSourceIndex, x, y);
    }
});

clearButton.addEventListener('click', () => {
    simulation.clearSources();
    simulation.clearRuler();
    updateSourceCount();
    updateSourceList();
});

simulation.animate();
updateSourceList();