// analyzer.js
class PromptAnalyzer {
    constructor() {
        this.contextKeywords = [
            'valoración', 'titulación', 'ácido', 'base', 'HCl', 'NaOH', 
            'H2SO4', 'KOH', 'indicador', 'fenolftaleína', 'naranja de metilo',
            'bureta', 'erlenmeyer', 'pipeta', 'pH', 'neutralización'
        ];
        
        this.objectiveVerbs = [
            'calcular', 'determinar', 'explicar', 'entender', 'verificar',
            'analizar', 'interpretar', 'ayuda', 'necesito', 'cómo',
            'qué', 'por qué', 'cuál', 'dónde'
        ];
        
        this.units = ['mL', 'L', 'M', 'mol', 'g', 'mg', 'pH', 'pOH'];
        
        this.init();
    }

    init() {
        // Event listeners
        document.getElementById('analyze-btn').addEventListener('click', () => this.analyzePrompt());
        document.getElementById('clear-btn').addEventListener('click', () => this.clearAll());
        document.getElementById('example-btn').addEventListener('click', () => this.showExamples());
        
        // Contador de caracteres
        const input = document.getElementById('prompt-input');
        input.addEventListener('input', () => {
            document.getElementById('char-count').textContent = input.value.length;
        });
    }

    analyzePrompt() {
        const promptText = document.getElementById('prompt-input').value.trim();
        
        if (promptText.length < 10) {
            alert('Por favor, escribe un prompt más largo (mínimo 10 caracteres)');
            return;
        }

        const scores = this.calculateScores(promptText);
        this.displayResults(scores);
        this.generateSuggestions(scores, promptText);
    }

    calculateScores(text) {
        const scores = {
            context: this.evaluateContext(text),
            specificity: this.evaluateSpecificity(text),
            clarity: this.evaluateClarity(text),
            objective: this.evaluateObjective(text),
            completeness: this.evaluateCompleteness(text)
        };
        
        scores.total = Math.round(
            scores.context * 0.25 +
            scores.specificity * 0.25 +
            scores.clarity * 0.20 +
            scores.objective * 0.20 +
            scores.completeness * 0.10
        );
        
        return scores;
    }

    evaluateContext(text) {
        const textLower = text.toLowerCase();
        let score = 0;
        let keywordsFound = 0;
        
        this.contextKeywords.forEach(keyword => {
            if (textLower.includes(keyword)) {
                keywordsFound++;
            }
        });
        
        // Escala de puntuación
        if (keywordsFound >= 5) score = 100;
        else if (keywordsFound >= 4) score = 80;
        else if (keywordsFound >= 3) score = 60;
        else if (keywordsFound >= 2) score = 40;
        else if (keywordsFound >= 1) score = 20;
        
        return score;
    }

    evaluateSpecificity(text) {
        let score = 0;
        
        // Buscar números
        const hasNumbers = /\d+\.?\d*/.test(text);
        if (hasNumbers) score += 40;
        
        // Buscar unidades
        const textLower = text.toLowerCase();
        let unitsFound = 0;
        this.units.forEach(unit => {
            if (textLower.includes(unit.toLowerCase())) {
                unitsFound++;
            }
        });
        
        if (unitsFound >= 3) score += 60;
        else if (unitsFound >= 2) score += 40;
        else if (unitsFound >= 1) score += 20;
        
        return Math.min(score, 100);
    }

    evaluateClarity(text) {
        let score = 100;
        
        // Penalizar por oraciones muy largas
        const sentences = text.split(/[.!?]+/);
        sentences.forEach(sentence => {
            if (sentence.split(' ').length > 30) {
                score -= 20;
            }
        });
        
        // Penalizar por falta de puntuación
        if (!text.includes('.') && !text.includes('?') && !text.includes('!')) {
            score -= 20;
        }
        
        // Bonificar por estructura clara
        if (text.includes('?')) score += 10;
        
        return Math.max(0, Math.min(score, 100));
    }

    evaluateObjective(text) {
        const textLower = text.toLowerCase();
        let score = 0;
        
        this.objectiveVerbs.forEach(verb => {
            if (textLower.includes(verb)) {
                score = Math.min(score + 30, 100);
            }
        });
        
        // Bonus por pregunta clara
        if (text.includes('?')) {
            score = Math.min(score + 20, 100);
        }
        
        return score;
    }

    evaluateCompleteness(text) {
        let score = 0;
        
        // Longitud mínima
        if (text.length >= 50) score += 50;
        else if (text.length >= 30) score += 30;
        else if (text.length >= 20) score += 10;
        
        // Tiene pregunta
        if (text.includes('?')) score += 30;
        
        // Tiene contexto y objetivo
        if (this.evaluateContext(text) > 0 && this.evaluateObjective(text) > 0) {
            score += 20;
        }
        
        return Math.min(score, 100);
    }

    displayResults(scores) {
        const resultsSection = document.getElementById('results-section');
        resultsSection.classList.remove('hidden');
        
        // Animar aparición
        resultsSection.style.opacity = '0';
        setTimeout(() => {
            resultsSection.style.opacity = '1';
        }, 100);
        
        // Mostrar estrellas para cada criterio
        this.displayStars('context', scores.context);
        this.displayStars('specificity', scores.specificity);
        this.displayStars('clarity', scores.clarity);
        this.displayStars('objective', scores.objective);
        this.displayStars('completeness', scores.completeness);
        
        // Puntuación total con barra de progreso
        const scoreBar = document.getElementById('score-bar');
        scoreBar.style.width = '0%';
        setTimeout(() => {
            scoreBar.style.width = scores.total + '%';
            scoreBar.className = 'score-bar ' + this.getScoreClass(scores.total);
        }, 200);
        
        document.getElementById('total-score-text').textContent = 
            `Puntuación Total: ${scores.total}/100`;
        
        // Mensaje según puntuación
        const message = this.getScoreMessage(scores.total);
        document.getElementById('score-message').textContent = message;
        document.getElementById('score-message').className = 
            'score-message ' + this.getScoreClass(scores.total);
    }

    displayStars(criterion, score) {
        const stars = Math.round(score / 20); // Convertir a escala de 5
        const starsContainer = document.getElementById(`${criterion}-stars`);
        const scoreValue = document.getElementById(`${criterion}-score`);
        
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= stars) {
                starsHTML += '⭐';
            } else {
                starsHTML += '☆';
            }
        }
        
        starsContainer.innerHTML = starsHTML;
        scoreValue.textContent = `${stars}/5`;
    }

    getScoreClass(score) {
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'fair';
        return 'needs-improvement';
    }

    getScoreMessage(score) {
        if (score >= 90) return '¡Excelente! Este prompt obtendrá respuestas muy útiles';
        if (score >= 70) return 'Buen prompt, obtendrás buenas respuestas';
        if (score >= 50) return 'Prompt aceptable, pero puede mejorar';
        if (score >= 30) return 'Necesita mejoras significativas';
        return 'Prompt muy vago, necesita reescribirse';
    }

    generateSuggestions(scores, promptText) {
        const suggestions = [];
        
        if (scores.context < 60) {
            suggestions.push('Agrega más contexto sobre tu experimento (tipo de valoración, reactivos utilizados)');
        }
        
        if (scores.specificity < 60) {
            suggestions.push('Incluye datos específicos: concentraciones, volúmenes, valores de pH');
        }
        
        if (scores.clarity < 60) {
            suggestions.push('Estructura mejor tu pregunta, usa puntuación adecuada');
        }
        
        if (scores.objective < 60) {
            suggestions.push('Especifica claramente qué necesitas: calcular, entender, verificar');
        }
        
        if (scores.completeness < 60) {
            suggestions.push('Desarrolla más tu pregunta, proporciona toda la información relevante');
        }
        
        // Mostrar sugerencias
        const suggestionsList = document.getElementById('suggestions-list');
        suggestionsList.innerHTML = '';
        suggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.textContent = suggestion;
            suggestionsList.appendChild(li);
        });
        
        // Si el prompt es muy malo, sugerir una mejora
        if (scores.total < 50) {
            this.suggestImprovedPrompt(promptText);
        }
    }

    suggestImprovedPrompt(originalPrompt) {
        const improvedSection = document.getElementById('improved-prompt');
        const improvedText = document.getElementById('improved-text');
        
        // Generar versión mejorada basándose en el prompt original
        let improved = "Estoy realizando una valoración de [especifica el ácido] con [especifica la base]. ";
        improved += "He usado [X mL] de [reactivo] con concentración [X M]. ";
        improved += "Observé que [describe tu observación]. ";
        improved += "¿Podrías ayudarme a [objetivo específico]?";
        
        improvedSection.classList.remove('hidden');
        improvedText.textContent = improved;
    }

    showExamples() {
        // Implementar modal con ejemplos
        const examples = [
            {
                title: "Cálculo de concentración",
                text: "Estoy titulando 25 mL de HCl con NaOH 0.1M. El indicador fenolftaleína viró a rosa a los 23.5 mL. ¿Cómo calculo la concentración exacta del HCl?",
                score: 95
            },
            {
                title: "Problema experimental",
                text: "En mi valoración de 20 mL de H2SO4 con KOH 0.15M, esperaba un viraje cerca de 25 mL pero ocurrió a 35 mL. ¿Qué pudo salir mal?",
                score: 90
            },
            {
                title: "Comprensión conceptual",
                text: "No entiendo por qué el pH en el punto de equivalencia de una valoración de ácido débil con base fuerte no es 7. ¿Puedes explicármelo con un ejemplo?",
                score: 85
            }
        ];
        
        // Mostrar en modal
        alert("Ejemplos disponibles en la versión completa");
    }

    clearAll() {
        document.getElementById('prompt-input').value = '';
        document.getElementById('char-count').textContent = '0';
        document.getElementById('results-section').classList.add('hidden');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new PromptAnalyzer();
});
