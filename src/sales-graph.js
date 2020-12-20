import { LitElement, html, css } from 'lit-element';
import * as d3 from 'd3';

const drawAreaSelector = '#drawArea';
const salesRangeSelector = '#sales-range';

export class SalesGraph extends LitElement {
  static get properties() {
    return {
      margin: {type: Object},
      width: {type: Number},
      height: {type: Number},
    }
  }

  constructor() {
    super();
    this.margin = { top:30, right: 30, bottom: 150, left: 30};
    this.width= 800 - this.margin.left - this.margin.right;
    this.height= 800 - this.margin.top - this.margin.bottom;
    const csvDataFile = 'sales.csv';

    d3.csv(csvDataFile, (d) => {
      d.sales = +d.sales; // Translate string into integer
      return d;
    })
    .then((csvData) => {
      this.csvData = csvData;
      console.log(`loaded ${csvDataFile}`);
      console.log(this.csvData);
    })
    .catch((error) => {
      throw error;
    });
  }



  render() {
    return html`
        <input type="button" value="go" @click=${this.goDraw}/>
          <div id="slider">
            <span>all</span>
            <input type="range" id="sales-range" value="0" @change=${this.salesRangeChanged} />
            <span>best sellers</span>
          </div>

          <div id="drawArea"></div>
          `;
  }

  goDraw() {

    const element = this.shadowRoot.querySelector(drawAreaSelector);
    console.log(`Found drawArea: ${JSON.stringify(element)}`);


    const svg = d3.select(element).append('svg')
    .attr('width', this.width + this.margin.left + this.margin.right)
    .attr('height', this.height + this.margin.top + this.margin.bottom)
    .append('g')
    .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    const xAxis = d3.scaleBand()
      .range([0, this.width])
      .padding(0.1);

    const yAxis = d3.scaleLinear()
      .range([this.height, 0]);


      const yAxisMaxValue = d3.max(this.csvData, data => data.sales);

      xAxis.domain(this.csvData.map(data => data.flavors));
      yAxis.domain([0, yAxisMaxValue])
      .nice(); // To end the axis with the max number nicely.

      svg.append('g')
      .call(d3.axisLeft(yAxis));

      svg.append('g')
      .attr('transform', `translate(0, ${this.height})`)
      .call(d3.axisBottom(xAxis))
      .selectAll('text')
      .attr('x', xAxis.bandwidth() / 2)
      .attr('y', 0)
      .attr('dy', '.35em')
      .attr('transform', 'rotate(90)')
      .attr('text-anchor', 'start');

      this.createBars(svg, this.csvData, xAxis, yAxis, this.height);

     const rangeSlider = this.shadowRoot.querySelector(salesRangeSelector);
      rangeSlider.min = 0;
      rangeSlider.max = yAxisMaxValue;
      // onChange is via @change event handler
  }

  salesRangeChanged(event) {
     const rangeSlider = this.shadowRoot.querySelector(salesRangeSelector);
        const filteredData = this.csvData.filter(d => d.sales >= rangeSlider.value);
      console.log(`event=${JSON.stringify(event)}`);
        console.log(`filteredData=${filteredData}`);
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
      .attr('height', d=> this.height - yAxis(d.sales));

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
}

customElements.define('sales-graph', SalesGraph);
