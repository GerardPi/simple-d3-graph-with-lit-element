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
      xAxis: {type: Object},
      yAxis: {type: Object},
      svg: {type: Object}
    }
  }

  constructor() {
    super();
    this.margin = { top:30, right: 30, bottom: 150, left: 30};
    this.width= 800 - this.margin.left - this.margin.right;
    this.height= 800 - this.margin.top - this.margin.bottom;
    const csvDataFile = 'sales.csv';
    this.xAxis = d3.scaleBand()
      .range([0, this.width])
      .padding(0.1);

    this.yAxis = d3.scaleLinear()
      .range([this.height, 0]);

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


    this.svg = d3.select(element).append('svg')
    .attr('width', this.width + this.margin.left + this.margin.right)
    .attr('height', this.height + this.margin.top + this.margin.bottom)
    .append('g')
    .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);



      const yAxisMaxValue = d3.max(this.csvData, data => data.sales);

      this.xAxis.domain(this.csvData.map(data => data.flavors));
      this.yAxis.domain([0, yAxisMaxValue])
      .nice(); // To end the axis with the max number nicely.

      this.svg.append('g')
        .call(d3.axisLeft(this.yAxis));

      this.svg.append('g')
        .attr('transform', `translate(0, ${this.height})`)
        .call(d3.axisBottom(this.xAxis))
        .selectAll('text')
        .attr('x', this.xAxis.bandwidth() / 2)
        .attr('y', 0)
        .attr('dy', '.35em')
        .attr('transform', 'rotate(90)')
        .attr('text-anchor', 'start');

      this.createBars(this.csvData);

     const rangeSlider = this.shadowRoot.querySelector(salesRangeSelector);
      rangeSlider.min = 0;
      rangeSlider.max = yAxisMaxValue;
      // onChange is via @change event handler
  }

  salesRangeChanged(event) {
    const rangeSlider = this.shadowRoot.querySelector(salesRangeSelector);
    const filteredData = this.csvData.filter(d => d.sales >= rangeSlider.value);
    console.log(`filteredData=${JSON.stringify(filteredData)}`);
    this.createBars(filteredData);
  }

  createBars(csvData) {
  this.svg.selectAll('.bar-group')
      .data(csvData, d => d.flavors)
      .join(
        enter => {
              const bar = enter.append('g')
              .attr('class', 'bar-group')
              .style('opacity', 1);

              bar.append('rect')
              .attr('class', 'bar')
              .attr('x', d => this.xAxis(d.flavors))
              .attr('y', d => this.yAxis(0))
              .attr('width', this.xAxis.bandwidth())
              .attr('height', 0)
              .style('fill', 'steelblue')
              .transition()
              .duration(750)
              .attr('y', d => this.yAxis(d.sales)) // Final y-position
              .attr('height', d=> this.height - this.yAxis(d.sales));

              bar.append('text')
              .text(d => d.sales)
              .attr('x', d => this.xAxis(d.flavors) + (this.xAxis.bandwidth()/2))
              .attr('y', d => this.yAxis(d.sales) - 5)
              .attr('font-family', 'sans-serif')
              .attr('font-size', 10)
              .attr('text-anchor', 'middle')
              .attr('opacity', 0)
              .transition()
              .duration(500)
              .style('opacity', 1);
        },
        update => {
          update.transition()
           .duration(750)
            .style('opacity', 1)
        },
        exit => {
          exit.transition()
          .duration(750)
          .style('opacity', 0.15)
        }
      )
  }
}

customElements.define('sales-graph', SalesGraph);
