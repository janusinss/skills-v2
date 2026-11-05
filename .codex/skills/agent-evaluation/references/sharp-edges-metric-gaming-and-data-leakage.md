### Agent optimized for metric, not actual task

Severity: MEDIUM

Situation: Agent scores well on metric but quality is poor

Symptoms:
- Metric scores high but users complain
- Agent behavior feels "off" despite good scores
- Gaming becomes obvious when metric changed

Why this breaks:
Metrics are proxies for quality.
Agents can game specific metrics.
Overfitting to evaluation criteria.

Recommended fix:

// Multi-dimensional evaluation to prevent gaming

class MultiDimensionalEvaluator {
    async evaluate(
        agent: Agent,
        testCases: TestCase[]
    ): Promise<MultiDimensionalReport> {
        const dimensions: EvaluationDimension[] = [
            {
                name: 'correctness',
                weight: 0.3,
                evaluator: this.evaluateCorrectness.bind(this)
            },
            {
                name: 'helpfulness',
                weight: 0.2,
                evaluator: this.evaluateHelpfulness.bind(this)
            },
            {
                name: 'safety',
                weight: 0.25,
                evaluator: this.evaluateSafety.bind(this)
            },
            {
                name: 'efficiency',
                weight: 0.15,
                evaluator: this.evaluateEfficiency.bind(this)
            },
            {
                name: 'user_preference',
                weight: 0.1,
                evaluator: this.evaluateUserPreference.bind(this)
            }
        ];

        const results: DimensionResult[] = [];

        for (const dimension of dimensions) {
            const score = await dimension.evaluator(agent, testCases);
            results.push({
                dimension: dimension.name,
                score,
                weight: dimension.weight,
                weightedScore: score * dimension.weight
            });
        }

        // Detect gaming: high in one dimension, low in others
        const gaming = this.detectGaming(results);

        return {
            dimensions: results,
            overallScore: results.reduce((sum, r) => sum + r.weightedScore, 0),
            gamingDetected: gaming.detected,
            gamingDetails: gaming.details,
            recommendation: this.generateRecommendation(results, gaming)
        };
    }

    private detectGaming(results: DimensionResult[]): GamingDetection {
        const scores = results.map(r => r.score);
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;

        // High variance suggests gaming one metric
        if (variance > 0.15) {
            const highScorer = results.find(r => r.score > mean + 0.2);
            const lowScorers = results.filter(r => r.score < mean - 0.1);

            return {
                detected: true,
                details: `High ${highScorer?.dimension} (${highScorer?.score.toFixed(2)}) but low ${lowScorers.map(l => l.dimension).join(', ')}`
            };
        }

        return { detected: false };
    }

    // Human evaluation for dimensions that can be gamed
    private async evaluateUserPreference(
        agent: Agent,
        testCases: TestCase[]
    ): Promise<number> {
        // Sample for human evaluation
        const sample = this.sampleForHumanEval(testCases, 20);

        // In real implementation, this would involve actual human raters
        // Here we simulate with a separate LLM acting as evaluator
        const evaluatorLLM = new EvaluatorLLM();

        const ratings: number[] = [];
        for (const test of sample) {
            const output = await agent.process(test.input);
            const rating = await evaluatorLLM.rateQuality(test, output);
            ratings.push(rating);
        }

        return ratings.reduce((a, b) => a + b, 0) / ratings.length;
    }
}

### Test data accidentally used in training or prompts

Severity: CRITICAL

Situation: Agent has seen test examples, artificially inflating scores

Symptoms:
- Perfect scores on specific tests
- Score drops on new test versions
- Agent "knows" answers it shouldn't

Why this breaks:
Test data in fine-tuning dataset.
Examples in system prompt.
RAG retrieves test documents.

Recommended fix:

// Prevent data leakage in agent evaluation

class LeakageDetector {
    async detectLeakage(
        agent: Agent,
        testSuite: TestCase[],
        trainingData: TrainingExample[],
        systemPrompt: string
    ): Promise<LeakageReport> {
        const leaks: Leak[] = [];

        // 1. Check for exact matches in training data
        for (const test of testSuite) {
            const exactMatch = trainingData.find(
                t => this.similarity(t.input, test.input) > 0.95
            );

            if (exactMatch) {
                leaks.push({
                    type: 'training_data',
                    testId: test.id,
                    matchedExample: exactMatch.id,
                    similarity: this.similarity(exactMatch.input, test.input)
                });
            }
        }

        // 2. Check system prompt for test examples
        for (const test of testSuite) {
            if (systemPrompt.includes(test.input.slice(0, 50))) {
                leaks.push({
                    type: 'system_prompt',
                    testId: test.id,
                    location: 'system_prompt'
                });
            }
        }

        // 3. Memorization test: check if agent reproduces exact answers
        const memorizationTests = await this.testMemorization(agent, testSuite);
        leaks.push(...memorizationTests);

        // 4. Check if RAG retrieves test documents
        if (agent.hasRAG) {
            const ragLeaks = await this.checkRAGLeakage(agent, testSuite);
            leaks.push(...ragLeaks);
        }

        return {
            hasLeakage: leaks.length > 0,
            leaks,
            affectedTests: [...new Set(leaks.map(l => l.testId))],
            recommendation: leaks.length > 0
                ? 'CRITICAL: Remove leaked tests and create new ones'
                : 'No leakage detected'
        };
    }

    private async testMemorization(
        agent: Agent,
        testCases: TestCase[]
    ): Promise<Leak[]> {
        const leaks: Leak[] = [];

        for (const test of testCases.slice(0, 20)) {
            // Give partial input, see if agent completes exactly
            const partialInput = test.input.slice(0, test.input.length / 2);
            const completion = await agent.process(
                `Complete this: ${partialInput}`
            );

            // Check if completion matches rest of input
            const expectedCompletion = test.input.slice(test.input.length / 2);
            if (this.similarity(completion.text, expectedCompletion) > 0.8) {
                leaks.push({
                    type: 'memorization',
                    testId: test.id,
                    evidence: 'Agent completed partial input with exact match'
                });
            }
        }

        return leaks;
    }

    private async checkRAGLeakage(
        agent: Agent,
        testCases: TestCase[]
    ): Promise<Leak[]> {
        const leaks: Leak[] = [];

        for (const test of testCases.slice(0, 10)) {
            // Check what RAG retrieves for test input
            const retrieved = await agent.ragSystem.retrieve(test.input);

            for (const doc of retrieved) {
                // Check if retrieved doc contains test answer
                if (test.expectedOutput &&
                    this.similarity(doc.content, test.expectedOutput) > 0.7) {
                    leaks.push({
                        type: 'rag_retrieval',
                        testId: test.id,
                        documentId: doc.id,
                        evidence: 'RAG retrieves document containing expected answer'
                    });
                }
            }
        }

        return leaks;
    }
}

