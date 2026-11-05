## Sharp Edges

### Agent scores well on benchmarks but fails in production

Severity: HIGH

Situation: High benchmark scores don't predict real-world performance

Symptoms:
- High benchmark scores, low user satisfaction
- Production errors not seen in testing
- Performance degrades under real load

Why this breaks:
Benchmarks have known answer patterns.
Production has long-tail edge cases.
User inputs are messier than test data.

Recommended fix:

// Bridge benchmark and production evaluation

class ProductionReadinessEvaluator {
    async evaluateForProduction(
        agent: Agent,
        benchmarkResults: BenchmarkResults,
        productionSamples: ProductionSample[]
    ): Promise<ProductionReadinessReport> {
        const gaps: ProductionGap[] = [];

        // 1. Test on real production samples (anonymized)
        const productionAccuracy = await this.testOnProductionSamples(
            agent,
            productionSamples
        );

        if (productionAccuracy < benchmarkResults.accuracy * 0.8) {
            gaps.push({
                type: 'accuracy_gap',
                benchmark: benchmarkResults.accuracy,
                production: productionAccuracy,
                impact: 'critical',
                recommendation: 'Benchmark not representative of production'
            });
        }

        // 2. Test on adversarial variants of benchmark
        const adversarialResults = await this.testAdversarialVariants(
            agent,
            benchmarkResults.testCases
        );

        if (adversarialResults.passRate < 0.7) {
            gaps.push({
                type: 'robustness_gap',
                originalPassRate: benchmarkResults.passRate,
                adversarialPassRate: adversarialResults.passRate,
                impact: 'high',
                recommendation: 'Agent not robust to input variations'
            });
        }

        // 3. Test edge cases from production logs
        const edgeCaseResults = await this.testProductionEdgeCases(
            agent,
            productionSamples
        );

        if (edgeCaseResults.failureRate > 0.2) {
            gaps.push({
                type: 'edge_case_failures',
                categories: edgeCaseResults.failureCategories,
                impact: 'high',
                recommendation: 'Add edge cases to training/testing'
            });
        }

        // 4. Latency under production load
        const loadResults = await this.testUnderLoad(agent, {
            concurrentRequests: 50,
            duration: 60000
        });

        if (loadResults.p95Latency > 5000) {
            gaps.push({
                type: 'latency_degradation',
                idleLatency: benchmarkResults.meanLatency,
                loadLatency: loadResults.p95Latency,
                impact: 'medium',
                recommendation: 'Optimize for concurrent load'
            });
        }

        return {
            ready: gaps.filter(g => g.impact === 'critical').length === 0,
            gaps,
            recommendations: this.prioritizeRemediation(gaps),
            confidenceScore: this.calculateConfidence(gaps, benchmarkResults)
        };
    }

    private async testAdversarialVariants(
        agent: Agent,
        testCases: TestCase[]
    ): Promise<AdversarialResults> {
        const variants: TestCase[] = [];

        for (const test of testCases) {
            // Generate variants
            variants.push(
                this.addTypos(test),
                this.rephrase(test),
                this.addNoise(test),
                this.changeFormat(test)
            );
        }

        const results = await Promise.all(
            variants.map(v => this.runTest(agent, v))
        );

        return {
            passRate: results.filter(r => r.passed).length / results.length,
            variantResults: results
        };
    }
}

### Same test passes sometimes, fails other times

Severity: HIGH

Situation: Test suite is unreliable, CI is broken or ignored

Symptoms:
- CI randomly fails
- Tests pass locally, fail in CI
- Re-running fixes test failures

Why this breaks:
LLM outputs are stochastic.
Tests expect deterministic behavior.
No retry or statistical handling.

Recommended fix:

// Handle flaky tests in LLM agent evaluation

class FlakyTestHandler {
    private readonly minRuns = 5;
    private readonly passThreshold = 0.8;  // 80% pass rate required
    private readonly flakinessThreshold = 0.2;  // Allow 20% flakiness

    async runWithFlakinessHandling(
        agent: Agent,
        test: TestCase
    ): Promise<FlakyTestResult> {
        const results: boolean[] = [];

        for (let i = 0; i < this.minRuns; i++) {
            try {
                const result = await this.runTest(agent, test);
                results.push(result.passed);
            } catch (error) {
                results.push(false);
            }
        }

        const passRate = results.filter(r => r).length / results.length;
        const flakiness = this.calculateFlakiness(results);

        return {
            testId: test.id,
            passed: passRate >= this.passThreshold,
            passRate,
            flakiness,
            isFlaky: flakiness > this.flakinessThreshold,
            confidence: this.calculateConfidence(passRate, this.minRuns),
            recommendation: this.getRecommendation(passRate, flakiness)
        };
    }

    private calculateFlakiness(results: boolean[]): number {
        // Flakiness = probability of getting different result on rerun
        const transitions = results.slice(1).filter((r, i) => r !== results[i]).length;
        return transitions / (results.length - 1);
    }

    private getRecommendation(passRate: number, flakiness: number): string {
        if (passRate >= 0.95 && flakiness < 0.1) {
            return 'Stable test - include in CI';
        } else if (passRate >= 0.8 && flakiness < 0.2) {
            return 'Slightly flaky - run multiple times in CI';
        } else if (passRate >= 0.5) {
            return 'Flaky test - investigate and improve test or agent';
        } else {
            return 'Failing test - fix agent or update test expectations';
        }
    }

    // Aggregate flaky test handling for CI
    async runTestSuiteForCI(
        agent: Agent,
        testSuite: TestCase[]
    ): Promise<CITestResult> {
        const results: FlakyTestResult[] = [];

        for (const test of testSuite) {
            results.push(await this.runWithFlakinessHandling(agent, test));
        }

        const overallPassRate = results.filter(r => r.passed).length / results.length;
        const flakyTests = results.filter(r => r.isFlaky);

        return {
            passed: overallPassRate >= 0.9,  // 90% of tests must pass
            overallPassRate,
            totalTests: testSuite.length,
            passedTests: results.filter(r => r.passed).length,
            flakyTests: flakyTests.map(t => t.testId),
            failedTests: results.filter(r => !r.passed).map(t => t.testId),
            recommendation: overallPassRate < 0.9
                ? `${Math.ceil(testSuite.length * 0.9 - results.filter(r => r.passed).length)} more tests must pass`
                : 'OK to merge'
        };
    }
}

