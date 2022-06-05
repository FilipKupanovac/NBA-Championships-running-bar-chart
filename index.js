import { select, axisTop, axisLeft } from "https://unpkg.com/d3?module"
import { SetupChart } from "./src/SetupChart.js"
import { ChartRender } from "./src/ChartRender.js";

const ChartSettings = {
    width: window.innerWidth * 0.95,
    height: window.innerHeight * 0.95,
    padding: 60
}

ChartSettings.innerWidth = ChartSettings.width - ChartSettings.padding *4;
ChartSettings.innerHeight = ChartSettings.height - ChartSettings.padding *4;

const Champions = [];

const svg = select('body')
    .append('svg')
    .attr('width', ChartSettings.width) 
    .attr('height', ChartSettings.height) 
    .attr('id','chart-svg')
    .style('background-color', '#ededed');

const chartContainer = svg.append('g')
    .attr('id', 'chart-container')
    .attr('width', ChartSettings.innerWidth) 
    .attr('height', ChartSettings.innerHeight) 
    .attr('transform', `translate(${ChartSettings.padding*3}, ${ChartSettings.padding *2})`)
    .style('background-color', 'lightblue');

const xAxisScale = SetupChart.setupXAxisScale(ChartSettings.innerWidth); 
const yAxisScale = SetupChart.setupYAxisScale(
    Champions,
    ChartSettings.innerHeight,0);

const xAxis = axisTop(xAxisScale).tickSize(-ChartSettings.innerHeight).ticks(1)
const yAxis = axisLeft(yAxisScale).tickSize(0)

const xOsContainer = SetupChart.setupXAxis(chartContainer, xAxis)
const yOsContainer = SetupChart.setupYAxis(chartContainer, yAxis)

chartContainer.append('text')
    .attr('id','current-date')
    .attr("transform", `translate(${ChartSettings.innerWidth}, ${ChartSettings.innerHeight})`)
    .text("GODINA")

svg.append('text')
    .attr('id','chart-title')
    .attr('transform', `translate(${ChartSettings.innerWidth/2.1},${ChartSettings.padding})`)
    .text('NBA Championships')

chartContainer.append('g').attr('class','rows')

const chartParts = {
    chartContainer: chartContainer,
    xScale: xAxisScale,
    yScale: yAxisScale,
    xAxis: xOsContainer,
    yAxis: yOsContainer,
    innerHeight: ChartSettings.innerHeight
}

let runningBarChart = ChartRender(chartParts, Champions)

runningBarChart.render()
