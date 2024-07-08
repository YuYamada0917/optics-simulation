class WaveSimulation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.speed = 2;
        this.waveSources = [];
        this.ruler = null;
        this.maxAmplitude = 1;
        this.decayFactor = 0.005;
        this.isRunning = true;
    }

    addSource(x, y, wavelength = 20, phase = 0) {
        this.waveSources.push({ x, y, wavelength, phase, time: 0 });
    }

    removeSource(index) {
        this.waveSources.splice(index, 1);
    }

    updateSource(index, wavelength, phase) {
        this.waveSources[index].wavelength = Number(wavelength);
        this.waveSources[index].phase = Number(phase);
    }

    restartWave(index) {
        this.waveSources[index].time = 0;
    }

    clearSources() {
        this.waveSources = [];
    }

    setRuler(sourceIndex, endX, endY) {
        if (sourceIndex >= 0 && sourceIndex < this.waveSources.length) {
            const source = this.waveSources[sourceIndex];
            this.ruler = {
                sourceIndex: sourceIndex,
                startX: source.x,
                startY: source.y,
                endX: endX,
                endY: endY
            };
        } else {
            this.ruler = null;
        }
    }

    clearRuler() {
        this.ruler = null;
    }

    calculateWave(x, y, source) {
        const dx = x - source.x;
        const dy = y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const phase = (distance - source.time * this.speed) / source.wavelength * 2 * Math.PI + source.phase;
        const amplitude = Math.exp(-this.decayFactor * distance);
        const waveWidth = Math.max(0.1, 1 - this.decayFactor * distance);
        
        const distFromPeak = Math.abs((phase % (2 * Math.PI)) - Math.PI) / Math.PI;
        const intensity = distFromPeak < waveWidth ? 1 - distFromPeak / waveWidth : 0;
        
        return intensity * amplitude;
    }

    calculateIntensity(x, y) {
        return this.waveSources.reduce((total, source) => {
            return total + this.calculateWave(x, y, source);
        }, 0);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        const imageData = this.ctx.createImageData(this.width, this.height);
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const intensity = this.calculateIntensity(x, y);
                const index = (y * this.width + x) * 4;
                
                const colorIntensity = Math.floor(intensity * 255);
                
                imageData.data[index] = colorIntensity;
                imageData.data[index + 1] = colorIntensity;
                imageData.data[index + 2] = colorIntensity;
                imageData.data[index + 3] = 255;
            }
        }
        this.ctx.putImageData(imageData, 0, 0);

        this.waveSources.forEach((source, index) => {
            this.ctx.fillStyle = `hsl(${index * 360 / this.waveSources.length}, 100%, 50%)`;
            this.ctx.beginPath();
            this.ctx.arc(source.x, source.y, 5, 0, Math.PI * 2);
            this.ctx.fill();
        });

        if (this.ruler) {
            const source = this.waveSources[this.ruler.sourceIndex];
            this.ctx.beginPath();
            this.ctx.moveTo(source.x, source.y);
            this.ctx.lineTo(this.ruler.endX, this.ruler.endY);
            this.ctx.strokeStyle = 'yellow';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            const dx = this.ruler.endX - source.x;
            const dy = this.ruler.endY - source.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            this.ctx.fillStyle = 'yellow';
            this.ctx.font = '14px Arial';
            this.ctx.fillText(`${distance.toFixed(1)} px`, (source.x + this.ruler.endX) / 2, (source.y + this.ruler.endY) / 2);
        }

        if (this.isRunning) {
            this.waveSources.forEach(source => {
                source.time += 0.1;
            });
        }
    }

    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    toggleSimulation() {
        this.isRunning = !this.isRunning;
    }
}