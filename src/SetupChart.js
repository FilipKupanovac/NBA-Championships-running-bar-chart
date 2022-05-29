import { scaleLinear, scaleBand } from "https://unpkg.com/d3?module";


export class SetupChart {
    static setupXAxisScale(
        endingWidth,

        startingWidth=0
    ){
        return scaleLinear()
            .range([startingWidth, endingWidth])
    }

    static setupYAxisScale(
        domainArray,
        endingHeight,
        startingHeight=0,
        labelsPaddingInner=0,
        labelsPaddingOuter=0
    ){
        return scaleBand()
            .domain(domainArray)
            .range([startingHeight, endingHeight])
            .paddingInner(labelsPaddingInner, labelsPaddingOuter)
    }

    static setupXAxis(
        selection,
        xAxis,
        verticalOffset=0
    ){
        return selection.append('g')
            .attr('id', 'x-axis')
            .attr('transform', `translate(0, ${verticalOffset})`)
            .call(xAxis)
    }

    static setupYAxis(
        selection,
        yAxis,
        horizontalOffset=0
    ){
        return selection.append('g')
            .attr('id', 'y-axis')
            .attr('transform', `translate(${horizontalOffset}, 0)`)
            .call(yAxis)
    }
}