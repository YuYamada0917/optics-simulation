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
        this.decayFactor = 0.01;
        this.isRunning = true;
        this.showInterference = false;
        this.tempRulerEnd = null;
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

    clearSources() {
        this.waveSources = [];
    }

    setRulerStart(x, y) {
        this.ruler = { startX: x, startY: y, endX: x, endY: y };
        this.tempRulerEnd = { x, y };
    }

    updateRulerEnd(x, y) {
        if (this.ruler) {
            this.tempRulerEnd = { x, y };
        }
    }

    setRulerEnd(x, y) {
        if (this.ruler) {
            this.ruler.endX = x;
            this.ruler.endY = y;
            this.tempRulerEnd = null;
        }
    }

    clearRuler() {
        this.ruler = null;
        this.tempRulerEnd = null;
    }

    calculateWave(x, y, source) {
        const dx = x - source.x;
        const dy = y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const phase = (distance - source.time * this.speed) / source.wavelength * 2 * Math.PI + source.phase;
        const amplitude = Math.exp(-this.decayFactor * distance);
        return amplitude * Math.cos(phase);
    }

    calculateIntensity(x, y) {
        if (this.showInterference) {
            return this.waveSources.reduce((total, source) => {
                return total + this.calculateWave(x, y, source);
            }, 0);
        } else {
            return this.waveSources.reduce((max, source) => {
                return Math.max(max, Math.abs(this.calculateWave(x, y, source)));
            }, 0);
        }
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
                
                if (this.showInterference) {
                    const colorIntensity = Math.floor(Math.abs(intensity) * 255);
                    if (intensity > 0) {
                        // 正の干渉は白の実線
                        imageData.data[index] = colorIntensity;
                        imageData.data[index + 1] = colorIntensity;
                        imageData.data[index + 2] = colorIntensity;
                    } else {
                        // 負の干渉は白の点線（強度を半分にして表現）
                        const dotted = (x + y) % 2 === 0;
                        imageData.data[index] = dotted ? colorIntensity / 2 : 0;
                        imageData.data[index + 1] = dotted ? colorIntensity / 2 : 0;
                        imageData.data[index + 2] = dotted ? colorIntensity / 2 : 0;
                    }
                } else {
                    const colorIntensity = Math.floor(intensity * 255);
                    imageData.data[index] = colorIntensity;
                    imageData.data[index + 1] = colorIntensity;
                    imageData.data[index + 2] = colorIntensity;
                }
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

        this.drawRuler();

        if (this.isRunning) {
            this.waveSources.forEach(source => {
                source.time += 0.1;
            });
        }
    }

    drawRuler() {
        if (this.ruler) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.ruler.startX, this.ruler.startY);
            const endX = this.tempRulerEnd ? this.tempRulerEnd.x : this.ruler.endX;
            const endY = this.tempRulerEnd ? this.tempRulerEnd.y : this.ruler.endY;
            this.ctx.lineTo(endX, endY);
            this.ctx.strokeStyle = 'yellow';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            const dx = endX - this.ruler.startX;
            const dy = endY - this.ruler.startY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            this.ctx.fillStyle = 'yellow';
            this.ctx.font = '14px Arial';
            this.ctx.fillText(`${distance.toFixed(1)} px`, (this.ruler.startX + endX) / 2, (this.ruler.startY + endY) / 2);
        }
    }


    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    toggleSimulation() {
        this.isRunning = !this.isRunning;
    }

    toggleInterferenceMode() {
        this.showInterference = !this.showInterference;
    }
}