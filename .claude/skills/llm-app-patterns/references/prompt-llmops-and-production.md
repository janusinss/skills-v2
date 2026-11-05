## 3. Prompt IDE Patterns

### 3.1 Prompt Templates with Variables

```python
class PromptTemplate:
    def __init__(self, template: str, variables: list[str]):
        self.template = template
        self.variables = variables

    def format(self, **kwargs) -> str:
        # Validate all variables provided
        missing = set(self.variables) - set(kwargs.keys())
        if missing:
            raise ValueError(f"Missing variables: {missing}")

        return self.template.format(**kwargs)

    def with_examples(self, examples: list[dict]) -> str:
        """Add few-shot examples"""
        example_text = "\n\n".join([
            f"Input: {ex['input']}\nOutput: {ex['output']}"
            for ex in examples
        ])
        return f"{example_text}\n\n{self.template}"

# Usage
summarizer = PromptTemplate(
    template="Summarize the following text in {style} style:\n\n{text}",
    variables=["style", "text"]
)

prompt = summarizer.format(
    style="professional",
    text="Long article content..."
)
```

### 3.2 Prompt Versioning & A/B Testing

```python
class PromptRegistry:
    def __init__(self, db):
        self.db = db

    def register(self, name: str, template: str, version: str):
        """Store prompt with version"""
        self.db.save({
            "name": name,
            "template": template,
            "version": version,
            "created_at": datetime.now(),
            "metrics": {}
        })

    def get(self, name: str, version: str = "latest") -> str:
        """Retrieve specific version"""
        return self.db.get(name, version)

    def ab_test(self, name: str, user_id: str) -> str:
        """Return variant based on user bucket"""
        variants = self.db.get_all_versions(name)
        bucket = hash(user_id) % len(variants)
        return variants[bucket]

    def record_outcome(self, prompt_id: str, outcome: dict):
        """Track prompt performance"""
        self.db.update_metrics(prompt_id, outcome)
```

### 3.3 Prompt Chaining

```python
class PromptChain:
    """
    Chain prompts together, passing output as input to next
    """

    def __init__(self, steps: list[dict]):
        self.steps = steps

    def run(self, initial_input: str) -> dict:
        context = {"input": initial_input}
        results = []

        for step in self.steps:
            prompt = step["prompt"].format(**context)
            output = llm.generate(prompt)

            # Parse output if needed
            if step.get("parser"):
                output = step"parser"

            context[step["output_key"]] = output
            results.append({
                "step": step["name"],
                "output": output
            })

        return {
            "final_output": context[self.steps[-1]["output_key"]],
            "intermediate_results": results
        }

# Example: Research → Analyze → Summarize
chain = PromptChain([
    {
        "name": "research",
        "prompt": "Research the topic: {input}",
        "output_key": "research"
    },
    {
        "name": "analyze",
        "prompt": "Analyze these findings:\n{research}",
        "output_key": "analysis"
    },
    {
        "name": "summarize",
        "prompt": "Summarize this analysis in 3 bullet points:\n{analysis}",
        "output_key": "summary"
    }
])
```

---

## 4. LLMOps & Observability

### 4.1 Metrics to Track

```python
LLM_METRICS = {
    # Performance
    "latency_p50": "50th percentile response time",
    "latency_p99": "99th percentile response time",
    "tokens_per_second": "Generation speed",

    # Quality
    "user_satisfaction": "Thumbs up/down ratio",
    "task_completion": "% tasks completed successfully",
    "hallucination_rate": "% responses with factual errors",

    # Cost
    "cost_per_request": "Average $ per API call",
    "tokens_per_request": "Average tokens used",
    "cache_hit_rate": "% requests served from cache",

    # Reliability
    "error_rate": "% failed requests",
    "timeout_rate": "% requests that timed out",
    "retry_rate": "% requests needing retry"
}
```

### 4.2 Logging & Tracing

```python
import logging
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

class LLMLogger:
    def log_request(self, request_id: str, data: dict):
        """Log LLM request for debugging and analysis"""
        log_entry = {
            "request_id": request_id,
            "timestamp": datetime.now().isoformat(),
            "model": data["model"],
            "prompt": data["prompt"][:500],  # Truncate for storage
            "prompt_tokens": data["prompt_tokens"],
            "temperature": data.get("temperature", 1.0),
            "user_id": data.get("user_id"),
        }
        logging.info(f"LLM_REQUEST: {json.dumps(log_entry)}")

    def log_response(self, request_id: str, data: dict):
        """Log LLM response"""
        log_entry = {
            "request_id": request_id,
            "completion_tokens": data["completion_tokens"],
            "total_tokens": data["total_tokens"],
            "latency_ms": data["latency_ms"],
            "finish_reason": data["finish_reason"],
            "cost_usd": self._calculate_cost(data),
        }
        logging.info(f"LLM_RESPONSE: {json.dumps(log_entry)}")

# Distributed tracing
@tracer.start_as_current_span("llm_call")
def call_llm(prompt: str) -> str:
    span = trace.get_current_span()
    span.set_attribute("prompt.length", len(prompt))

    response = llm.generate(prompt)

    span.set_attribute("response.length", len(response))
    span.set_attribute("tokens.total", response.usage.total_tokens)

    return response.content
```

### 4.3 Evaluation Framework

```python
class LLMEvaluator:
    """
    Evaluate LLM outputs for quality
    """

    def evaluate_response(self,
                          question: str,
                          response: str,
                          ground_truth: str = None) -> dict:
        scores = {}

        # Relevance: Does it answer the question?
        scores["relevance"] = self._score_relevance(question, response)

        # Coherence: Is it well-structured?
        scores["coherence"] = self._score_coherence(response)

        # Groundedness: Is it based on provided context?
        scores["groundedness"] = self._score_groundedness(response)

        # Accuracy: Does it match ground truth?
        if ground_truth:
            scores["accuracy"] = self._score_accuracy(response, ground_truth)

        # Harmfulness: Is it safe?
        scores["safety"] = self._score_safety(response)

        return scores

    def run_benchmark(self, test_cases: list[dict]) -> dict:
        """Run evaluation on test set"""
        results = []
        for case in test_cases:
            response = llm.generate(case["prompt"])
            scores = self.evaluate_response(
                question=case["prompt"],
                response=response,
                ground_truth=case.get("expected")
            )
            results.append(scores)

        return self._aggregate_scores(results)
```

---

## 5. Production Patterns

### 5.1 Caching Strategy

```python
import hashlib
from functools import lru_cache

class LLMCache:
    def __init__(self, redis_client, ttl_seconds=3600):
        self.redis = redis_client
        self.ttl = ttl_seconds

    def _cache_key(self, prompt: str, model: str, **kwargs) -> str:
        """Generate deterministic cache key"""
        content = f"{model}:{prompt}:{json.dumps(kwargs, sort_keys=True)}"
        return hashlib.sha256(content.encode()).hexdigest()

    def get_or_generate(self, prompt: str, model: str, **kwargs) -> str:
        key = self._cache_key(prompt, model, **kwargs)

        # Check cache
        cached = self.redis.get(key)
        if cached:
            return cached.decode()

        # Generate
        response = llm.generate(prompt, model=model, **kwargs)

        # Cache (only cache deterministic outputs)
        if kwargs.get("temperature", 1.0) == 0:
            self.redis.setex(key, self.ttl, response)

        return response
```

### 5.2 Rate Limiting & Retry

```python
import time
from tenacity import retry, wait_exponential, stop_after_attempt

class RateLimiter:
    def __init__(self, requests_per_minute: int):
        self.rpm = requests_per_minute
        self.timestamps = []

    def acquire(self):
        """Wait if rate limit would be exceeded"""
        now = time.time()

        # Remove old timestamps
        self.timestamps = [t for t in self.timestamps if now - t < 60]

        if len(self.timestamps) >= self.rpm:
            sleep_time = 60 - (now - self.timestamps[0])
            time.sleep(sleep_time)

        self.timestamps.append(time.time())

# Retry with exponential backoff
@retry(
    wait=wait_exponential(multiplier=1, min=4, max=60),
    stop=stop_after_attempt(5)
)
def call_llm_with_retry(prompt: str) -> str:
    try:
        return llm.generate(prompt)
    except RateLimitError:
        raise  # Will trigger retry
    except APIError as e:
        if e.status_code >= 500:
            raise  # Retry server errors
        raise  # Don't retry client errors
```

### 5.3 Fallback Strategy

```python
class LLMWithFallback:
    def __init__(self, primary: str, fallbacks: list[str]):
        self.primary = primary
        self.fallbacks = fallbacks

    def generate(self, prompt: str, **kwargs) -> str:
        models = [self.primary] + self.fallbacks

        for model in models:
            try:
                return llm.generate(prompt, model=model, **kwargs)
            except (RateLimitError, APIError) as e:
                logging.warning(f"Model {model} failed: {e}")
                continue

        raise AllModelsFailedError("All models exhausted")

# Usage
llm_client = LLMWithFallback(
    primary="gpt-4-turbo",
    fallbacks=["gpt-3.5-turbo", "claude-3-sonnet"]
)
```

---
