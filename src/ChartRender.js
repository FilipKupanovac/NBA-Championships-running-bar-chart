import { easeLinear, axisLeft, axisTop, max, selectAll, select, scaleBand, range } from "https://unpkg.com/d3?module";
import { NBAChampions } from "./Dataset.js";
import { TeamColors } from "./TeamColors.js";

export function ChartRender(chartParts, dataset) { //dataset represents total champions with titles count and last championship

    var { chartContainer, xScale, yScale, xAxis, yAxis, innerHeight } = chartParts;
    var chartTransition;
    var transitionDuration = 800;
    var barHeight = 0
    var finishedAnimation = false


    function render(index = 0) {


        chartTransition = chartContainer
            .transition()
            .duration(transitionDuration)
            .ease(easeLinear)
            .on('end',
                () => {
                    if (index < NBAChampions.length) {
                        render(index + 1)
                    }
                }
            );

        if (index < NBAChampions.length) {
            draw(NBAChampions[index], chartTransition);
        }
        else {
            finishedAnimation = true
        }
    }

    function draw(latestChampionship, transition) {
        setYear(latestChampionship);
        updateDataset(latestChampionship)

        setDomains();
        transitionScales(transition);

        let barGroups = chartContainer.select('.rows')
            .selectAll('g.row-container')
            .data(dataset, ({ name }) => name)

        let barGroupsEnter = barGroups
            .enter()
            .append('g')
            .attr('class', 'row-container')
            .attr('transform', `translate(0,${innerHeight})`)

        barGroupsEnter.append('rect')
            .attr('class', 'row-rect')
            .attr('width', 0)
            .attr('height', barHeight)
            .attr('fill', function (d) { return d.color })

        barGroupsEnter
            .on('mouseover', function (event, d) {
                if (finishedAnimation) {


                    let { color, titles } = d
                    let barWidth = this.getBoundingClientRect().width
                    select(this)
                        .attr('fill', 'black')
                    let ixer = scaleBand().domain(range(d.titles)).range([0, this.getBoundingClientRect().width])
                    select(this).selectAll('g')
                        .data(range(d.titles))
                        .enter()

                        .append('rect')
                        .attr('class', 'title-year')
                        .attr('x', 0)
                        .attr('y', 0)
                        .attr('width', Math.ceil(ixer.step()))
                        .attr('height', Math.ceil(barHeight));

                    let offset = innerHeight / (2 * yScale.domain().length) - barHeight / 2
                    select(this).selectAll('.title-year')
                        .attr('width', ixer.step())
                        .attr('height', barHeight)
                        .attr('fill', 'white')
                        .attr('transform', function (d, i) { return `translate(${ixer(i)}, ${offset})` })

                    select(this).selectAll('.row-container')
                        .data(d.titleYears)
                        .enter()
                        .append('text')
                        .attr('class', 'title-year-text')
                        .attr('width', ixer.step()).attr('height', barHeight)
                        .attr('x', 0).attr('y', 0)
                        .attr('font-weight', 'bold')
                        .style('fill', color)
                        .attr('transform', function (d, i) { return `translate(${ixer(i) + ixer.step() * 0.2}, ${offset + barHeight / 1.5})` })
                        .text(function (d) { return d })

                    select(this).selectAll('.row-container')
                        .data(range(1))
                        .enter()
                        .append('text').attr('class', 'total-championships')
                        .attr('width', ixer.step()).attr('height', barHeight)
                        .attr('x', 0).attr('y', 0)
                        .attr('font-weight', 'bold')
                        .style('fill', color)
                        .attr('transform', function (d, i) { return `translate(${barWidth + ixer.step() * 0.2}, ${offset + barHeight / 1.5})` })
                        .text(titles.length)
                }
            })
            .on('mouseout', function (event, d) {
                if (finishedAnimation) {

                    select(this).attr('fill', d.color)
                        .selectAll('rect.title-year').remove()
                    select(this).selectAll('text.title-year-text').remove()
                    select(this).selectAll('text.total-championships').remove()
                }
            })


        let barUpdate = barGroupsEnter.merge(barGroups);
        barUpdate.transition(transition)
            .attr('transform', ({ name }) => `translate(0, ${yScale(name)})`)

        let heightOffset = innerHeight / (2 * yScale.domain().length) - barHeight / 2

        barUpdate.select('.row-rect')
            .transition(transition)
            .attr('width', ({ titles }) => xScale(titles))
            .attr('height', barHeight)
            .attr('transform', `translate(0, ${heightOffset})`)
            .attr('fill', function (d) {
                return d.color
            })

        barGroups.exit()
    }

    function setYear(championship) {
        chartContainer.select('#current-date')
            .text(championship.year)
    }
    function updateBarSettings() {
        barHeight =
            (innerHeight / (yScale.domain().length)) * 0.8 > 100
                ? 100
                : (innerHeight / (yScale.domain().length)) * 0.8;
    }
    function updateDataset(latestChampionship) {

        if (!dataset.map(({ name }) => name).includes(latestChampionship.name)) {
            let color;
            TeamColors.forEach(team => {
                if (team.name === latestChampionship.name)
                    color = team.color;
            })
            dataset.push({
                name: latestChampionship.name, titles: 0, lastTitleYear: 0,
                titleYears: [],
                color: color
            })

            updateBarSettings();
        }

        dataset.forEach(team => {
            if (team.name === latestChampionship.name) {
                team.titles++;
                team.lastTitleYear = latestChampionship.year;

                team.titleYears.push(latestChampionship.year)
            }
        });

        if (latestChampionship["nameChanges"] !== undefined) {
            changeName(latestChampionship.nameChanges)
            changeColor(latestChampionship.nameChanges)
        }
        sortDataset()
    }

    function sortDataset() {
        dataset.sort(
            function (a, b) {
                return a.titles !== b.titles
                    ? b.titles - a.titles
                    : a.lastTitleYear - b.lastTitleYear
            }
        )
    }
    function changeColor(nameChanges) {
        nameChanges.forEach(change => {
            let a;
            let nombre = change.to;
            let colors = TeamColors.filter(({ name }) => name === nombre)[0]
            dataset.forEach(team => {
                nombre === team.name
                    ? team.color = colors.color
                    : a = 1;
            })

        }
        )
    }
    function changeName(nameChanges) {
        nameChanges.forEach(nameChange => {
            dataset.forEach(team => {
                if (team.name === nameChange.from) {
                    team.name = nameChange.to;
                    return;
                }
            })
        })

    }

    function setDomains() {
        xScale.domain([0, dataset[0].titles]);
        yScale.domain(dataset.map(({ name }) => name));
    }

    function transitionScales(transition) {
        yAxis.transition(transition)
            .call(axisLeft(yScale))
        xAxis.transition(transition)
            .call(
                axisTop(xScale)
                    .ticks(max([1, dataset[0].titles / 2]))
                    .tickSize(-innerHeight)
            )
    }

    return {
        render
    }
}
