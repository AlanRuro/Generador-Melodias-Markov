// Definición de las notas musicales y sus frecuencias
const notes = {
    'DO': 261.63,  // C4 
    'RE': 293.66,  // D4
    'MI': 329.63,  // E4
    'FA': 349.23,  // F4
    'SOL': 392.00, // G4
    'LA': 440.00,  // A4
    'SI': 493.88   // B4
};

// Matriz de transiciones inicial
let transitionMatrix = {
    'DO': { 'DO': 0.1428, 'RE': 0.1428, 'MI': 0.1428, 'FA': 0.1428, 'SOL': 0.1428, 'LA': 0.1428, 'SI': 0.1428 },
    'RE': { 'DO': 0.1428, 'RE': 0.1428, 'MI': 0.1428, 'FA': 0.1428, 'SOL': 0.1428, 'LA': 0.1428, 'SI': 0.1428 },
    'MI': { 'DO': 0.1428, 'RE': 0.1428, 'MI': 0.1428, 'FA': 0.1428, 'SOL': 0.1428, 'LA': 0.1428, 'SI': 0.1428 },
    'FA': { 'DO': 0.1428, 'RE': 0.1428, 'MI': 0.1428, 'FA': 0.1428, 'SOL': 0.1428, 'LA': 0.1428, 'SI': 0.1428 },
    'SOL': { 'DO': 0.1428, 'RE': 0.1428, 'MI': 0.1428, 'FA': 0.1428, 'SOL': 0.1428, 'LA': 0.1428, 'SI': 0.1428 },
    'LA': { 'DO': 0.1428, 'RE': 0.1428, 'MI': 0.1428, 'FA': 0.1428, 'SOL': 0.1428, 'LA': 0.1428, 'SI': 0.1428 },
    'SI': { 'DO': 0.1428, 'RE': 0.1428, 'MI': 0.1428, 'FA': 0.1428, 'SOL': 0.1428, 'LA': 0.1428, 'SI': 0.1428 }
};

// Lista de melodías disponibles
directory = 'transition_matrices'
const availableMelodies = [
    { name: 'Billie Jean', file: directory+'/BillieJean.json' },
    { name: 'Piratas', file: directory+'/PiratasDelCaribe.json' },
    { name: 'Happy Birthday', file: directory+'/HappyBirthday.json' },
    { name: 'Mario Bros', file: directory+'/MarioBros.json' },
];

class MelodyGenerator {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.isPlaying = false;
        this.currentNote = null;
        this.noteHistory = [];
    }

    generateNextNote() {
        if (!this.currentNote) {
            const noteNames = Object.keys(notes);
            this.currentNote = noteNames[Math.floor(Math.random() * noteNames.length)];
        } else {
            const probabilities = transitionMatrix[this.currentNote];
            const random = Math.random();
            let cumulativeProbability = 0;

            for (const [note, probability] of Object.entries(probabilities)) {
                cumulativeProbability += probability;
                if (random <= cumulativeProbability) {
                    this.currentNote = note;
                    break;
                }
            }
        }
        return this.currentNote;
    }

    async playNote(note) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        // Parametros para que suene bonito
        // Configurar el oscilador
        oscillator.type = 'triangle';
        oscillator.frequency.value = notes[note];
        
        // Configurar el filtro
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        filter.Q.value = 1;
        
        // Conectar los nodos
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Fade in más suave
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.6, this.audioContext.currentTime + 0.2);
        
        oscillator.start();
        
        // Fade out más suave
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.6);
        oscillator.stop(this.audioContext.currentTime + 0.6);
    }

    async startMelody(noteCount) {
        this.isPlaying = true;
        this.noteHistory = [];
        
        for (let i = 0; i < noteCount && this.isPlaying; i++) {
            const note = this.generateNextNote();
            this.noteHistory.push(note);
            
            document.getElementById('currentNote').textContent = `Nota actual: ${note}`;
            this.updateNoteHistory();
            
            await this.playNote(note);
            
            await new Promise(resolve => setTimeout(resolve, 400));
        }
        
        this.isPlaying = false;
    }

    stopMelody() {
        this.isPlaying = false;
    }

    updateNoteHistory() {
        const historyContainer = document.getElementById('noteHistory');
        historyContainer.innerHTML = '';
        
        this.noteHistory.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note';
            noteElement.textContent = note;
            historyContainer.appendChild(noteElement);
        });
    }
}

async function loadTransitionMatrix(jsonFile) {
    try {
        console.log('Intentando cargar archivo:', jsonFile);
        const response = await fetch(jsonFile);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const matrix = await response.json();
        console.log('Matriz cargada exitosamente:', matrix);
        return matrix;
    } catch (error) {
        console.error('Error al cargar la matriz de transiciones:', error);
        return null;
    }
}

function updateTransitionMatrixDisplay() {
    console.log('Actualizando visualización de la matriz:', transitionMatrix);
    const matrixContainer = document.getElementById('transitionMatrix');
    matrixContainer.innerHTML = '';
    
    const noteNames = Object.keys(notes);
    
    const headerRow = document.createElement('div');
    headerRow.className = 'matrix-row';
    headerRow.innerHTML = '<div class="matrix-cell matrix-header"></div>';
    noteNames.forEach(note => {
        headerRow.innerHTML += `<div class="matrix-cell matrix-header">${note}</div>`;
    });
    matrixContainer.appendChild(headerRow);
    
    noteNames.forEach(note => {
        const row = document.createElement('div');
        row.className = 'matrix-row';
        row.innerHTML = `<div class="matrix-cell matrix-header">${note}</div>`;
        
        noteNames.forEach(targetNote => {
            const probability = transitionMatrix[note][targetNote];
            row.innerHTML += `<div class="matrix-cell">${(probability * 100).toFixed(0)}%</div>`;
        });
        
        matrixContainer.appendChild(row);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const melodyGenerator = new MelodyGenerator();
    
    const melodySelect = document.getElementById('melodySelect');
    availableMelodies.forEach(melody => {
        const option = document.createElement('option');
        option.value = melody.file;
        option.textContent = melody.name;
        melodySelect.appendChild(option);
    });
    
    melodySelect.addEventListener('change', async (event) => {
        const selectedFile = event.target.value;
        if (selectedFile) {
            try {
                console.log('Archivo seleccionado:', selectedFile);
                const matrixContainer = document.getElementById('transitionMatrix');
                matrixContainer.innerHTML = '<div class="loading">Cargando matriz de transiciones...</div>';
                
                const newTransitionMatrix = await loadTransitionMatrix(selectedFile);
                if (newTransitionMatrix) {
                    console.log('Matriz anterior:', transitionMatrix);
                    transitionMatrix = { ...newTransitionMatrix };
                    console.log('Nueva matriz:', transitionMatrix);
                    
                    const successMessage = document.createElement('div');
                    successMessage.className = 'success-message';
                    successMessage.textContent = 'Matriz de transiciones actualizada con éxito';
                    matrixContainer.parentElement.insertBefore(successMessage, matrixContainer);
                    
                    updateTransitionMatrixDisplay();
                    
                    setTimeout(() => {
                        successMessage.remove();
                    }, 3000);
                } else {
                    throw new Error('No se pudo cargar la matriz de transiciones');
                }
            } catch (error) {
                console.error('Error al cargar la matriz:', error);
                matrixContainer.innerHTML = '<div class="error-message">Error al cargar la matriz de transiciones. Por favor, intente nuevamente.</div>';
            }
        }
    });
    
    updateTransitionMatrixDisplay();
    
    document.getElementById('playButton').addEventListener('click', () => {
        const noteCount = parseInt(document.getElementById('noteCount').value);
        melodyGenerator.startMelody(noteCount);
    });
    
    document.getElementById('stopButton').addEventListener('click', () => {
        melodyGenerator.stopMelody();
    });
}); 