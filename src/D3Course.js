import { LitElement, html, css } from 'lit-element';
import * as d3 from 'd3';
import { openWcLogo } from './open-wc-logo.js';

export class D3Course extends LitElement {
  static get properties() {
    return {
      title: { type: String },
      page: { type: String },
    };
  }

  static get styles() {
    return css`
      :host {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        font-size: calc(10px + 2vmin);
        color: #1a2b42;
        max-width: 960px;
        margin: 0 auto;
        text-align: center;
      }

      main {
        flex-grow: 1;
      }

      .logo > svg {
        margin-top: 36px;
        animation: app-logo-spin infinite 20s linear;
      }

      @keyframes app-logo-spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .app-footer {
        font-size: calc(12px + 0.5vmin);
        align-items: center;
      }

      .app-footer a {
        margin-left: 5px;
      }
      #slider {
        text-align: center;
        margin: 20px;
        font-family: sans-serif;
        font-size: 10px;
        line-height: 2;
      }
      #sales-range {
        vertical-align: bottom;
      }
      #drawArea {
        width: 100%;
        text-align: center;
      }
    `;
  }

  goDraw() {
    const margin = { top:30, right: 30, bottom: 150, left: 30};
    const width= 800 - margin.left - margin.right;
    const height= 800 - margin.top - margin.bottom;
    const drawAreaSelector = '#drawArea';
    const salesRangeSelector = '#sales-range';

    const element = this.shadowRoot.querySelector(drawAreaSelector);
    console.log(`Found drawArea: ${JSON.stringify(element)}`);

    const rangeSlider = this.shadowRoot.querySelector(salesRangeSelector);
    console.log(`Found slider: ${JSON.stringify(rangeSlider)}`);

    const svg = d3.select(element).append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const xAxis = d3.scaleBand()
      .range([0, width])
      .padding(0.1);

    const yAxis = d3.scaleLinear()
      .range([height, 0]);


    d3.csv('sales.csv', (d) => {
      d.sales = +d.sales; // Translate string into integer
      return d;
    })
    .then((csvData) => {
      console.log(csvData);
      const yAxisMaxValue = d3.max(csvData, data => data.sales);

      xAxis.domain(csvData.map(data => data.flavors));
      yAxis.domain([0, yAxisMaxValue])
      .nice(); // To end the axis with the max number nicely.

      svg.append('g')
      .call(d3.axisLeft(yAxis));

      svg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xAxis))
      .selectAll('text')
      .attr('x', xAxis.bandwidth() / 2)
      .attr('y', 0)
      .attr('dy', '.35em')
      .attr('transform', 'rotate(90)')
      .attr('text-anchor', 'start');

      this.createBars(svg, csvData, xAxis, yAxis, height);

      rangeSlider.min = 0;
      rangeSlider.max = yAxisMaxValue;
      rangeSlider.onChange = () => {
        const filteredData = csvData.filter(d => d.sales >= rangeSlider.value);
        console.log(`filteredData=${filteredData}`);
      };
    })
    .catch((error) => {
      throw error;
    });
  }
  salesRangeChanged(event) {
    console.log(`event=${JSON.stringify(event)}`);
  }
  createBars(svg, csvData, xAxis, yAxis, height) {
      const bar = svg.selectAll('.bar-group')
      .data(csvData)
      .enter()
      .append('g')
      .attr('class', 'bar-group');

      bar.append('rect')
      .attr('class', 'bar')
      .attr('x', d => xAxis(d.flavors))
      .attr('y', d => yAxis(0))
      .attr('width', xAxis.bandwidth())
      .attr('height', 0)
      .style('fill', 'steelblue')
      .transition()
      .duration(750)
      .attr('y', d => yAxis(d.sales)) // Final y-position
      .attr('height', d=> height - yAxis(d.sales));

      bar.append('text')
      .text(d => d.sales)
      .attr('x', d => xAxis(d.flavors) + (xAxis.bandwidth()/2))
      .attr('y', d => yAxis(d.sales) - 5)
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .attr('text-anchor', 'middle')
      .attr('opacity', 0)
      .transition()
      .duration(500)
      .style('opacity', 1);
  }


  render() {
    const rendered = html`
      <main>
        <div class="logo">${openWcLogo}</div>
        <h1>My app</h1>
        <div id="slider">
          <span>all</span>
          <input type="range" id="sales-range" value="0" @change=${this.salesRangeChanged} />
          <span>best sellers</span>
        </div>

        <div id="drawArea"></div>

        <p>Edit <code>src/D3Course.js</code> and save to reload.</p>
        <input type="button" value="go" @click=${this.goDraw}/>
        <a
          class="app-link"
          href="https://open-wc.org/developing/#code-examples"
          target="_blank"
          rel="noopener noreferrer"
        >
          Code examples
        </a>
      </main>

      <p class="app-footer">
        🚽 Made with love by
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/open-wc"
          >open-wc</a
        >.
      </p>
    `;
    return rendered;
  }
}
