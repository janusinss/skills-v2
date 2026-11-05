### Statistical Test Evaluation

Run tests multiple times and analyze result distributions

**When to use**: Evaluating stochastic agent behavior

interface TestResult {
    testId: string;
    runId: string;
    passed: boolean;
    score: number;  // 0-1 for partial credit
    latencyMs: number;
    tokensUsed: number;
    output: string;
    expectedBehaviors: string[];
    actualBehaviors: string[];
}

interface StatisticalAnalysis {
    passRate: number;
    confidence95: [number, number];
    meanScore: number;
    stdDevScore: number;
    meanLatency: number;
    p95Latency: number;
    behaviorConsistency: number;
}

class StatisticalEvaluator {
    private readonly minRuns = 10;
    private readonly confidenceLevel = 0.95;

    async evaluateAgent(
        agent: Agent,
        testSuite: TestCase[]
    ): Promise<EvaluationReport> {
        const results: TestResult[] = [];

        // Run each test multiple times
        for (const test of testSuite) {
            for (let run = 0; run < this.minRuns; run++) {
                const result = await this.runTest(agent, test, run);
                results.push(result);
            }
        }

        // Analyze by test
        const byTest = this.groupByTest(results);
        const testAnalyses = new Map<string, StatisticalAnalysis>();

        for (const [testId, testResults] of byTest) {
            testAnalyses.set(testId, this.analyzeResults(testResults));
        }

        // Overall analysis
        const overall = this.analyzeResults(results);

        return {
            overall,
            byTest: testAnalyses,
            concerns: this.identifyConcerns(testAnalyses),
            recommendations: this.generateRecommendations(testAnalyses)
        };
    }

    private analyzeResults(results: TestResult[]): StatisticalAnalysis {
        const passes = results.filter(r => r.passed);
        const passRate = passes.length / results.length;

        // Calculate confidence interval for pass rate
        const z = 1.96;  // 95% confidence
        const se = Math.sqrt((passRate * (1 - passRate)) / results.length);
        const confidence95: [number, number] = [
            Math.max(0, passRate - z * se),
            Math.min(1, passRate + z * se)
        ];

        const scores = results.map(r => r.score);
        const latencies = results.map(r => r.latencyMs);

        return {
            passRate,
            confidence95,
            meanScore: this.mean(scores),
            stdDevScore: this.stdDev(scores),
            meanLatency: this.mean(latencies),
            p95Latency: this.percentile(latencies, 95),
            behaviorConsistency: this.calculateConsistency(results)
        };
    }

    private calculateConsistency(results: TestResult[]): number {
        // How consistent are the behaviors across runs?
        if (results.length < 2) return 1;

        const behaviorSets = results.map(r => new Set(r.actualBehaviors));
        let consistencySum = 0;
        let comparisons = 0;

        for (let i = 0; i < behaviorSets.length; i++) {
            for (let j = i + 1; j < behaviorSets.length; j++) {
                const intersection = new Set(
                    [...behaviorSets[i]].filter(x => behaviorSets[j].has(x))
                );
                const union = new Set([...behaviorSets[i], ...behaviorSets[j]]);
                consistencySum += intersection.size / union.size;
                comparisons++;
            }
        }

        return consistencySum / comparisons;
    }

    private identifyConcerns(analyses: Map<string, StatisticalAnalysis>): Concern[] {
        const concerns: Concern[] = [];

        for (const [testId, analysis] of analyses) {
            if (analysis.passRate < 0.8) {
                concerns.push({
                    testId,
                    type: 'low_pass_rate',
                    severity: analysis.passRate < 0.5 ? 'critical' : 'high',
                    message: `Pass rate ${(analysis.passRate * 100).toFixed(1)}% below threshold`
                });
            }

            if (analysis.behaviorConsistency < 0.7) {
                concerns.push({
                    testId,
                    type: 'inconsistent_behavior',
                    severity: 'high',
                    message: `Behavior consistency ${(analysis.behaviorConsistency * 100).toFixed(1)}% indicates unstable agent`
                });
            }

            if (analysis.stdDevScore > 0.3) {
                concerns.push({
                    testId,
                    type: 'high_variance',
                    severity: 'medium',
                    message: 'High score variance suggests unpredictable quality'
                });
            }
        }

        return concerns;
    }
}

### Behavioral Contract Testing

Define and test agent behavioral invariants

**When to use**: Need to ensure agent stays within bounds

// Define behavioral contracts: what agent must/must not do

interface BehavioralContract {
    name: string;
    description: string;
    mustBehaviors: BehaviorAssertion[];
    mustNotBehaviors: BehaviorAssertion[];
    contextual?: ConditionalBehavior[];
}

interface BehaviorAssertion {
    behavior: string;
    detector: (output: AgentOutput) => boolean;
    severity: 'critical' | 'high' | 'medium' | 'low';
}

class BehavioralContractTester {
    private contracts: BehavioralContract[] = [];

    // Example contract for a customer service agent
    defineCustomerServiceContract(): BehavioralContract {
        return {
            name: 'customer_service_agent',
            description: 'Contract for customer service agent behavior',

            mustBehaviors: [
                {
                    behavior: 'responds_politely',
                    detector: (output) =>
                        !this.containsRudeLanguage(output.text),
                    severity: 'critical'
                },
                {
                    behavior: 'stays_on_topic',
                    detector: (output) =>
                        this.isRelevantToCustomerService(output.text),
                    severity: 'high'
                },
                {
                    behavior: 'acknowledges_issue',
                    detector: (output) =>
                        output.text.includes('understand') ||
                        output.text.includes('sorry to hear'),
                    severity: 'medium'
                }
            ],

            mustNotBehaviors: [
                {
                    behavior: 'reveals_internal_info',
                    detector: (output) =>
                        this.containsInternalInfo(output.text),
                    severity: 'critical'
                },
                {
                    behavior: 'makes_unauthorized_promises',
                    detector: (output) =>
                        output.text.includes('guarantee') ||
                        output.text.includes('promise'),
                    severity: 'high'
                },
                {
                    behavior: 'provides_legal_advice',
                    detector: (output) =>
                        this.containsLegalAdvice(output.text),
                    severity: 'critical'
                }
            ],

            contextual: [
                {
                    condition: (input) => input.includes('refund'),
                    mustBehaviors: [
                        {
                            behavior: 'refers_to_policy',
                            detector: (output) =>
                                output.text.includes('policy') ||
                                output.text.includes('Terms'),
                            severity: 'high'
                        }
                    ]
                }
            ]
        };
    }

    async testContract(
        agent: Agent,
        contract: BehavioralContract,
        testInputs: string[]
    ): Promise<ContractTestResult> {
        const violations: ContractViolation[] = [];

        for (const input of testInputs) {
            const output = await agent.process(input);

            // Check must behaviors
            for (const assertion of contract.mustBehaviors) {
                if (!assertion.detector(output)) {
                    violations.push({
                        input,
                        type: 'missing_required_behavior',
                        behavior: assertion.behavior,
                        severity: assertion.severity,
                        output: output.text.slice(0, 200)
                    });
                }
            }

            // Check must not behaviors
            for (const assertion of contract.mustNotBehaviors) {
                if (assertion.detector(output)) {
                    violations.push({
                        input,
                        type: 'prohibited_behavior',
                        behavior: assertion.behavior,
                        severity: assertion.severity,
                        output: output.text.slice(0, 200)
                    });
                }
            }

            // Check contextual behaviors
            for (const conditional of contract.contextual || []) {
                if (conditional.condition(input)) {
                    for (const assertion of conditional.mustBehaviors) {
                        if (!assertion.detector(output)) {
                            violations.push({
                                input,
                                type: 'missing_contextual_behavior',
                                behavior: assertion.behavior,
                                severity: assertion.severity,
                                output: output.text.slice(0, 200)
                            });
                        }
                    }
                }
            }
        }

        return {
            contract: contract.name,
            totalTests: testInputs.length,
            violations,
            passed: violations.filter(v => v.severity === 'critical').length === 0
        };
    }
}

