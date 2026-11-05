---
name: "kaizen"
description: "Apply continuous improvement, Poka-Yoke error proofing, and standardized work to codebases. Use when refactoring, preventing bug classes, or improving quality."
metadata:
  upstream-risk: "critical"
  upstream-source: "community"
  upstream-date_added: "2026-02-27"
---

# Kaizen: Continuous Improvement

## Overview

Small improvements, continuously. Error-proof by design. Follow what works. Build only what's needed.

**Core principle:** Many small improvements beat one big change. Prevent errors at design time, not with fixes.

## When to Use
**Always applied for:**

- Code implementation and refactoring
- Architecture and design decisions
- Process and workflow improvements
- Error handling and validation

**Philosophy:** Quality through incremental progress and prevention, not perfection through massive effort.

## The Four Pillars

### 1. Continuous Improvement (Kaizen)

Small, frequent improvements compound into major gains.

#### Principles

**Incremental over revolutionary:**

- Make smallest viable change that improves quality
- One improvement at a time
- Verify each change before next
- Build momentum through small wins

**Always leave code better:**

- Fix small issues as you encounter them
- Refactor while you work (within scope)
- Update outdated comments
- Remove dead code when you see it

**Iterative refinement:**

- First version: make it work
- Second pass: make it clear
- Third pass: make it efficient
- Don't try all three at once

<Good>
```typescript
// Iteration 1: Make it work
const calculateTotal = (items: Item[]) => {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  return total;
};

// Iteration 2: Make it clear (refactor)
const calculateTotal = (items: Item[]): number => {
return items.reduce((total, item) => {
return total + (item.price \* item.quantity);
}, 0);
};

// Iteration 3: Make it robust (add validation)
const calculateTotal = (items: Item[]): number => {
if (!items?.length) return 0;

return items.reduce((total, item) => {
if (item.price < 0 || item.quantity < 0) {
throw new Error('Price and quantity must be non-negative');
}
return total + (item.price \* item.quantity);
}, 0);
};

````
Each step is complete, tested, and working
</Good>

<Bad>
```typescript
// Trying to do everything at once
const calculateTotal = (items: Item[]): number => {
  // Validate, optimize, add features, handle edge cases all together
  if (!items?.length) return 0;
  const validItems = items.filter(item => {
    if (item.price < 0) throw new Error('Negative price');
    if (item.quantity < 0) throw new Error('Negative quantity');
    return item.quantity > 0; // Also filtering zero quantities
  });
  // Plus caching, plus logging, plus currency conversion...
  return validItems.reduce(...); // Too many concerns at once
};
````

Overwhelming, error-prone, hard to verify
</Bad>

#### In Practice

**When implementing features:**

1. Start with simplest version that works
2. Add one improvement (error handling, validation, etc.)
3. Test and verify
4. Repeat if time permits
5. Don't try to make it perfect immediately

**When refactoring:**

- Fix one smell at a time
- Commit after each improvement
- Keep tests passing throughout
- Stop when "good enough" (diminishing returns)

**When reviewing code:**

- Suggest incremental improvements (not rewrites)
- Prioritize: critical → important → nice-to-have
- Focus on highest-impact changes first
- Accept "better than before" even if not perfect

### 2. Poka-Yoke (Error Proofing)

Design systems that prevent errors at compile/design time, not runtime.

#### Principles

**Make errors impossible:**

- Type system catches mistakes
- Compiler enforces contracts
- Invalid states unrepresentable
- Errors caught early (left of production)

**Design for safety:**

- Fail fast and loudly
- Provide helpful error messages
- Make correct path obvious
- Make incorrect path difficult

**Defense in layers:**

1. Type system (compile time)
2. Validation (runtime, early)
3. Guards (preconditions)
4. Error boundaries (graceful degradation)

#### Type System Error Proofing

<Good>
```typescript
// Error: string status can be any value
type OrderBad = {
  status: string; // Can be "pending", "PENDING", "pnding", anything!
  total: number;
};

// Good: Only valid states possible
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered';
type Order = {
status: OrderStatus;
total: number;
};

// Better: States with associated data
type Order =
| { status: 'pending'; createdAt: Date }
| { status: 'processing'; startedAt: Date; estimatedCompletion: Date }
| { status: 'shipped'; trackingNumber: string; shippedAt: Date }
| { status: 'delivered'; deliveredAt: Date; signature: string };

// Now impossible to have shipped without trackingNumber

````
Type system prevents entire classes of errors
</Good>

<Good>
```typescript
// Make invalid states unrepresentable
type NonEmptyArray<T> = [T, ...T[]];

const firstItem = <T>(items: NonEmptyArray<T>): T => {
  return items[0]; // Always safe, never undefined!
};

// Caller must prove array is non-empty
const items: number[] = [1, 2, 3];
if (items.length > 0) {
  firstItem(items as NonEmptyArray<number>); // Safe
}
````

Function signature guarantees safety
</Good>

#### Validation Error Proofing

<Good>
```typescript
// Error: Validation after use
const processPayment = (amount: number) => {
  const fee = amount * 0.03; // Used before validation!
  if (amount <= 0) throw new Error('Invalid amount');
  // ...
};

// Good: Validate immediately
const processPayment = (amount: number) => {
if (amount <= 0) {
throw new Error('Payment amount must be positive');
}
if (amount > 10000) {
throw new Error('Payment exceeds maximum allowed');
}

const fee = amount \* 0.03;
// ... now safe to use
};

// Better: Validation at boundary with branded type
type PositiveNumber = number & { readonly \_\_brand: 'PositiveNumber' };

const validatePositive = (n: number): PositiveNumber => {
if (n <= 0) throw new Error('Must be positive');
return n as PositiveNumber;
};

const processPayment = (amount: PositiveNumber) => {
// amount is guaranteed positive, no need to check
const fee = amount \* 0.03;
};

// Validate at system boundary
const handlePaymentRequest = (req: Request) => {
const amount = validatePositive(req.body.amount); // Validate once
processPayment(amount); // Use everywhere safely
};

````
Validate once at boundary, safe everywhere else
</Good>

#### Guards and Preconditions

<Good>
```typescript
// Early returns prevent deeply nested code
const processUser = (user: User | null) => {
  if (!user) {
    logger.error('User not found');
    return;
  }

  if (!user.email) {
    logger.error('User email missing');
    return;
  }

  if (!user.isActive) {
    logger.info('User inactive, skipping');
    return;
  }

  // Main logic here, guaranteed user is valid and active
  sendEmail(user.email, 'Welcome!');
};
````

Guards make assumptions explicit and enforced
</Good>

#### Configuration Error Proofing

<Good>
```typescript
// Error: Optional config with unsafe defaults
type ConfigBad = {
  apiKey?: string;
  timeout?: number;
};

const client = new APIClient({ timeout: 5000 }); // apiKey missing!

// Good: Required config, fails early
type Config = {
apiKey: string;
timeout: number;
};

const loadConfig = (): Config => {
const apiKey = process.env.API_KEY;
if (!apiKey) {
throw new Error('API_KEY environment variable required');
}

return {
apiKey,
timeout: 5000,
};
};

// App fails at startup if config invalid, not during request
const config = loadConfig();
const client = new APIClient(config);

````
Fail at startup, not in production
</Good>

#### In Practice

**When designing APIs:**
- Use types to constrain inputs
- Make invalid states unrepresentable
- Return Result<T, E> instead of throwing
- Document preconditions in types

**When handling errors:**
- Validate at system boundaries

- Use guards for preconditions
- Fail fast with clear messages
- Log context for debugging

**When configuring:**
- Required over optional with defaults
- Validate all config at startup
- Fail deployment if config invalid
- Don't allow partial configurations

### 3–4. Standardized Work & Just-In-Time (JIT)

See [Standardized Work and Just-In-Time (JIT) Patterns](references/standardized-work-and-jit.md).

## Integration with Commands

The Kaizen skill guides how you work. The commands provide structured analysis:

- **`/why`**: Root cause analysis (5 Whys)
- **`/cause-and-effect`**: Multi-factor analysis (Fishbone)
- **`/plan-do-check-act`**: Iterative improvement cycles
- **`/analyse-problem`**: Comprehensive documentation (A3)
- **`/analyse`**: Smart method selection (Gemba/VSM/Muda)

Use commands for structured problem-solving. Apply skill for day-to-day development.

## Red Flags

**Violating Continuous Improvement:**

- "I'll refactor it later" (never happens)
- Leaving code worse than you found it
- Big bang rewrites instead of incremental

**Violating Poka-Yoke:**

- "Users should just be careful"
- Validation after use instead of before
- Optional config with no validation

**Violating Standardized Work:**

- "I prefer to do it my way"
- Not checking existing patterns
- Ignoring project conventions

**Violating Just-In-Time:**

- "We might need this someday"
- Building frameworks before using them
- Optimizing without measuring

## Remember

**Kaizen is about:**

- Small improvements continuously
- Preventing errors by design
- Following proven patterns
- Building only what's needed

**Not about:**

- Perfection on first try
- Massive refactoring projects
- Clever abstractions
- Premature optimization

**Mindset:** Good enough today, better tomorrow. Repeat.

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
