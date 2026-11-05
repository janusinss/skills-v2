---
name: "claude-d3js-skill"
description: "Create interactive D3.js data visualizations, custom SVG/Canvas charts, scales, and force networks. Use when building bespoke charts or data visualizations."
metadata:
  upstream-risk: "critical"
  upstream-source: "community"
  upstream-date_added: "2026-02-27"
---

# D3.js Visualisation

## Overview

This skill provides guidance for creating sophisticated, interactive data visualisations using d3.js. D3.js (Data-Driven Documents) excels at binding data to DOM elements and applying data-driven transformations to create custom, publication-quality visualisations with precise control over every visual element. The techniques work across any JavaScript environment, including vanilla JavaScript, React, Vue, Svelte, and other frameworks.

## When to use d3.js

**Use d3.js for:**
- Custom visualisations requiring unique visual encodings or layouts
- Interactive explorations with complex pan, zoom, or brush behaviours
- Network/graph visualisations (force-directed layouts, tree diagrams, hierarchies, chord diagrams)
- Geographic visualisations with custom projections
- Visualisations requiring smooth, choreographed transitions
- Publication-quality graphics with fine-grained styling control
- Novel chart types not available in standard libraries

**Consider alternatives for:**
- 3D visualisations - use Three.js instead

## Core workflow

### 1. Set up d3.js

Import d3 at the top of your script:

```javascript
import * as d3 from 'd3';
```

Or use the CDN version (7.x):

```html
<script src="https://d3js.org/d3.v7.min.js"></script>
```

All modules (scales, axes, shapes, transitions, etc.) are accessible through the `d3` namespace.

### 2. Choose the integration pattern

**Pattern A: Direct DOM manipulation (recommended for most cases)**
Use d3 to select DOM elements and manipulate them imperatively. This works in any JavaScript environment:

```javascript
function drawChart(data) {
  if (!data || data.length === 0) return;

  const svg = d3.select('#chart'); // Select by ID, class, or DOM element

  // Clear previous content
  svg.selectAll("*").remove();

  // Set up dimensions
  const width = 800;
  const height = 400;
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };

  // Create scales, axes, and draw visualisation
  // ... d3 code here ...
}

// Call when data changes
drawChart(myData);
```

**Pattern B: Declarative rendering (for frameworks with templating)**
Use d3 for data calculations (scales, layouts) but render elements via your framework:

```javascript
function getChartElements(data) {
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .range([0, 400]);

  return data.map((d, i) => ({
    x: 50,
    y: i * 30,
    width: xScale(d.value),
    height: 25
  }));
}

// In React: {getChartElements(data).map((d, i) => <rect key={i} {...d} fill="steelblue" />)}
// In Vue: v-for directive over the returned array
// In vanilla JS: Create elements manually from the returned data
```

Use Pattern A for complex visualisations with transitions, interactions, or when leveraging d3's full capabilities. Use Pattern B for simpler visualisations or when your framework prefers declarative rendering.

### 3. Structure the visualisation code

Follow this standard structure in your drawing function:

```javascript
function drawVisualization(data) {
  if (!data || data.length === 0) return;

  const svg = d3.select('#chart'); // Or pass a selector/element
  svg.selectAll("*").remove(); // Clear previous render

  // 1. Define dimensions
  const width = 800;
  const height = 400;
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // 2. Create main group with margins
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // 3. Create scales
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.x)])
    .range([0, innerWidth]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.y)])
    .range([innerHeight, 0]); // Note: inverted for SVG coordinates

  // 4. Create and append axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(xAxis);

  g.append("g")
    .call(yAxis);

  // 5. Bind data and create visual elements
  g.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => xScale(d.x))
    .attr("cy", d => yScale(d.y))
    .attr("r", 5)
    .attr("fill", "steelblue");
}

// Call when data changes
drawVisualization(myData);
```

### 4. Implement responsive sizing

Make visualisations responsive to container size:

```javascript
function setupResponsiveChart(containerId, data) {
  const container = document.getElementById(containerId);
  const svg = d3.select(`#${containerId}`).append('svg');

  function updateChart() {
    const { width, height } = container.getBoundingClientRect();
    svg.attr('width', width).attr('height', height);

    // Redraw visualisation with new dimensions
    drawChart(data, svg, width, height);
  }

  // Update on initial load
  updateChart();

  // Update on window resize
  window.addEventListener('resize', updateChart);

  // Return cleanup function
  return () => window.removeEventListener('resize', updateChart);
}

// Usage:
// const cleanup = setupResponsiveChart('chart-container', myData);
// cleanup(); // Call when component unmounts or element removed
```

Or use ResizeObserver for more direct container monitoring:

```javascript
function setupResponsiveChartWithObserver(svgElement, data) {
  const observer = new ResizeObserver(() => {
    const { width, height } = svgElement.getBoundingClientRect();
    d3.select(svgElement)
      .attr('width', width)
      .attr('height', height);

    // Redraw visualisation
    drawChart(data, d3.select(svgElement), width, height);
  });

  observer.observe(svgElement.parentElement);
  return () => observer.disconnect();
}
```

## Common visualisation patterns, interactivity & transitions

See [Visualisation Patterns, Interactivity & Transitions](references/visualisation-patterns.md) for bar, line, scatter, chord, heatmap, pie, force-directed network, tooltip, zoom/pan, and transition templates.

## Scales reference

### Quantitative scales

```javascript
// Linear scale
const xScale = d3.scaleLinear()
  .domain([0, 100])
  .range([0, 500]);

// Log scale (for exponential data)
const logScale = d3.scaleLog()
  .domain([1, 1000])
  .range([0, 500]);

// Power scale
const powScale = d3.scalePow()
  .exponent(2)
  .domain([0, 100])
  .range([0, 500]);

// Time scale
const timeScale = d3.scaleTime()
  .domain([new Date(2020, 0, 1), new Date(2024, 0, 1)])
  .range([0, 500]);
```

### Ordinal scales

```javascript
// Band scale (for bar charts)
const bandScale = d3.scaleBand()
  .domain(['A', 'B', 'C', 'D'])
  .range([0, 400])
  .padding(0.1);

// Point scale (for line/scatter categories)
const pointScale = d3.scalePoint()
  .domain(['A', 'B', 'C', 'D'])
  .range([0, 400]);

// Ordinal scale (for colours)
const colourScale = d3.scaleOrdinal(d3.schemeCategory10);
```

### Sequential scales

```javascript
// Sequential colour scale
const colourScale = d3.scaleSequential(d3.interpolateBlues)
  .domain([0, 100]);

// Diverging colour scale
const divScale = d3.scaleDiverging(d3.interpolateRdBu)
  .domain([-10, 0, 10]);
```

## Best practices

### Data preparation

Always validate and prepare data before visualisation:

```javascript
// Filter invalid values
const cleanData = data.filter(d => d.value != null && !isNaN(d.value));

// Sort data if order matters
const sortedData = [...data].sort((a, b) => b.value - a.value);

// Parse dates
const parsedData = data.map(d => ({
  ...d,
  date: d3.timeParse("%Y-%m-%d")(d.date)
}));
```

### Performance optimisation

For large datasets (>1000 elements):

```javascript
// Use canvas instead of SVG for many elements
// Use quadtree for collision detection
// Simplify paths with d3.line().curve(d3.curveStep)
// Implement virtual scrolling for large lists
// Use requestAnimationFrame for custom animations
```

### Accessibility

Make visualisations accessible:

```javascript
// Add ARIA labels
svg.attr("role", "img")
   .attr("aria-label", "Bar chart showing quarterly revenue");

// Add title and description
svg.append("title").text("Quarterly Revenue 2024");
svg.append("desc").text("Bar chart showing revenue growth across four quarters");

// Ensure sufficient colour contrast
// Provide keyboard navigation for interactive elements
// Include data table alternative
```

### Styling

Use consistent, professional styling:

```javascript
// Define colour palettes upfront
const colours = {
  primary: '#4A90E2',
  secondary: '#7B68EE',
  background: '#F5F7FA',
  text: '#333333',
  gridLines: '#E0E0E0'
};

// Apply consistent typography
svg.selectAll("text")
  .style("font-family", "Inter, sans-serif")
  .style("font-size", "12px");

// Use subtle grid lines
g.selectAll(".tick line")
  .attr("stroke", colours.gridLines)
  .attr("stroke-dasharray", "2,2");
```

## Common issues and solutions

**Issue**: Axes not appearing
- Ensure scales have valid domains (check for NaN values)
- Verify axis is appended to correct group
- Check transform translations are correct

**Issue**: Transitions not working
- Call `.transition()` before attribute changes
- Ensure elements have unique keys for proper data binding
- Check that useEffect dependencies include all changing data

**Issue**: Responsive sizing not working
- Use ResizeObserver or window resize listener
- Update dimensions in state to trigger re-render
- Ensure SVG has width/height attributes or viewBox

**Issue**: Performance problems
- Limit number of DOM elements (consider canvas for >1000 items)
- Debounce resize handlers
- Use `.join()` instead of separate enter/update/exit selections
- Avoid unnecessary re-renders by checking dependencies

## Resources

### references/
Contains detailed reference materials:
- `d3-patterns.md` - Comprehensive collection of visualisation patterns and code examples
- `scale-reference.md` - Complete guide to d3 scales with examples
- `colour-schemes.md` - D3 colour schemes and palette recommendations

### assets/

Contains boilerplate templates:

- `chart-template.js` - Starter template for basic chart
- `interactive-template.js` - Template with tooltips, zoom, and interactions
- `sample-data.json` - Example datasets for testing

These templates work with vanilla JavaScript, React, Vue, Svelte, or any other JavaScript environment. Adapt them as needed for your specific framework.

To use these resources, read the relevant files when detailed guidance is needed for specific visualisation types or patterns.

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
