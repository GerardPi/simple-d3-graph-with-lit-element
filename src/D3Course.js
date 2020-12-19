import { LitElement, html, css } from 'lit-element';
import { openWcLogo } from './open-wc-logo.js';
import * as d3 from 'd3';

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
    `;
  }
  goDraw() {
    const margin = { top:30, right: 30, bottom: 150, left: 30};
    const width= 800 - margin.left - margin.right;
    const height= 800 - margin.top - margin.bottom;
    const targetSelector = '#drawArea';
    const element = this.shadowRoot.querySelector(targetSelector);
    const svg = d3.select(element).append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

    console.log(`added svg to ${targetSelector}`);

    const xAxis = d3.scaleBand()
      .range([0, width])
      .padding(0.1);

    const yAxis = d3.scaleLinear()
      .range([height, 0]);

    d3
    .csv('sales.csv', (d) => {
      d.sales = +d.sales; // Translate string into integer
      return d;
    })
    .then((csvData) => {
      console.log(csvData);
      xAxis.domain(csvData.map(data => data.flavors));
      yAxis.domain([0, d3.max(csvData, data => data.sales)])
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
    })
    .catch((error) => {
      throw error;
    });
  }

  render() {
    const rendered = html`
      <main>
        <div class="logo">${openWcLogo}</div>
        <h1>My app</h1>
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
