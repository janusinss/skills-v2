### Evaluation and Scoring

Evaluate LLM outputs systematically

**When to use**: Quality assurance and improvement

from langfuse import Langfuse

langfuse = Langfuse()

# Manual scoring in code
trace = langfuse.trace(name="qa-flow")

# After getting response
trace.score(
    name="relevance",
    value=0.85,  # 0-1 scale
    comment="Response addressed the question"
)

trace.score(
    name="correctness",
    value=1,  # Binary: 0 or 1
    data_type="BOOLEAN"
)

# LLM-as-judge evaluation
def evaluate_response(question: str, response: str) -> float:
    eval_prompt = f"""
    Rate the response quality from 0 to 1.

    Question: {question}
    Response: {response}

    Output only a number between 0 and 1.
    """

    result = openai.chat.completions.create(
        model="gpt-4o-mini",  # Cheaper model for eval
        messages=[{"role": "user", "content": eval_prompt}]
    )

    return float(result.choices[0].message.content.strip())

# Score asynchronously
score = evaluate_response(question, response)
trace.score(
    name="quality-llm-judge",
    value=score
)

# Create evaluation dataset
dataset = langfuse.create_dataset(name="support-qa-v1")

# Add items to dataset
langfuse.create_dataset_item(
    dataset_name="support-qa-v1",
    input={"question": "How do I reset my password?"},
    expected_output="Go to settings > security > reset password"
)

# Run evaluation on dataset
dataset = langfuse.get_dataset("support-qa-v1")

for item in dataset.items:
    # Generate response
    response = generate_response(item.input["question"])

    # Link to dataset item
    trace = langfuse.trace(name="eval-run")
    trace.generation(
        name="response",
        input=item.input,
        output=response
    )

    # Score against expected
    similarity = calculate_similarity(response, item.expected_output)
    trace.score(name="similarity", value=similarity)

    # Link trace to dataset item
    item.link(trace, "eval-run-1")

### Decorator Pattern

Clean instrumentation with decorators

**When to use**: Function-based applications

from langfuse.decorators import observe, langfuse_context

@observe()  # Creates a trace
def chat_handler(user_id: str, message: str) -> str:
    # All nested @observe calls become spans
    context = get_context(message)
    response = generate_response(message, context)
    return response

@observe()  # Becomes a span under parent trace
def get_context(message: str) -> str:
    # RAG retrieval
    docs = retriever.get_relevant_documents(message)
    return "\n".join([d.page_content for d in docs])

@observe(as_type="generation")  # LLM generation span
def generate_response(message: str, context: str) -> str:
    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": f"Context: {context}"},
            {"role": "user", "content": message}
        ]
    )
    return response.choices[0].message.content

# Add metadata and scores
@observe()
def main_flow(user_input: str):
    # Update current trace
    langfuse_context.update_current_trace(
        user_id="user-123",
        session_id="session-456",
        tags=["production"]
    )

    result = process(user_input)

    # Score the trace
    langfuse_context.score_current_trace(
        name="success",
        value=1 if result else 0
    )

    return result

# Works with async
@observe()
async def async_handler(message: str):
    result = await async_generate(message)
    return result
