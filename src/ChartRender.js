import { easeLinear, axisLeft, axisTop, max, selectAll, select, scaleBand, range } from "https://unpkg.com/d3?module";
import { NBAChampions } from "./Dataset.js";
import { TeamColors } from "./TeamColors.js";

export function ChartRender(chartParts, dataset) { //dataset represents total champions with titles count and last championship

    var { chartContainer, xScale, yScale, xAxis, yAxis, innerHeight} = chartParts;
    var chartTransition;
    var transitionDuration = 400;
    var barHeight = 0
    

    function render(index=0){


        chartTransition = chartContainer
            .transition()
            .duration(transitionDuration)
            .ease(easeLinear)
            .on('end', 
                () =>{
                    if(index < NBAChampions.length){
                        render(index + 1)
                    }
                }
            );
        
        if(index < NBAChampions.length){
            draw(NBAChampions[index], chartTransition);
        }
    }

    function draw(latestChampionship, transition){
        setYear(latestChampionship);
        updateDataset(latestChampionship)

        setDomains();
        transitionScales(transition);

        let barGroups = chartContainer.select('.rows')
            .selectAll('g.row-container')
            .data(dataset, ({name}) => name)
        
        let barGroupsEnter = barGroups
            .enter()
            .append('g')
            .attr('class', 'row-container')
            .attr('transform', `translate(0,${innerHeight})`)

        barGroupsEnter.append('rect')
            .attr('class','row-rect')
            .attr('width', 0)
            .attr('height', barHeight )
            .attr('fill', function(d) { return d.color})

        //#region ŽELJE I POZDRAVI
            /* .on('mouseover', function(event, d) {
                select(this)
                    .attr('fill','black')
                console.log(this.getBoundingClientRect().width)
                let ixer = scaleBand().domain(range(d.titles)).range([0,this.getBoundingClientRect().width])
                console.log(yScale(d.titles-1))
                select(this).selectAll('g')
                    .data(range(d.titles))
                    .enter()

                    .append('rect') //OVAJ MORA BITI ISTI KAO  OVAJ (1)
                    .attr('class','title-year')
                    .attr('x',0)
                    .attr('y',0)
                    .attr('width', Math.ceil(ixer.step()))
                    .attr('height', Math.ceil(barHeight));

                select(this).selectAll('.title-year')
                    .attr('width', ixer.step())
                    .attr('height', barHeight)
                    .attr('fill', 'white')
                    .attr('transform', function(d,i) {console.log("iiiiiii"); return `translate(0,${ixer(i)})`})
                    .text(function(d,i){console.log(i); return i})
                
            })
            .on('mouseout', function(event, d){
                select(this)
                .attr('fill', d.color)
                .selectAll('rect').remove() //OVAJ MORA BITI ISTI KAO  OVAJ (2)
            }) */
            //#endregion
            

        let barUpdate = barGroupsEnter.merge(barGroups);
        barUpdate.transition(transition)
            .attr('transform', ({name}) => `translate(0, ${yScale(name)})`)
        
        let heightOffset = innerHeight/(2 * yScale.domain().length) - barHeight/2
        
        barUpdate.select('.row-rect')
            .transition(transition)
            .attr('width', ({titles}) => xScale(titles))
            .attr('height', barHeight)
            .attr('transform', `translate(0, ${heightOffset})`)
            .attr('fill', function(d) {  
                return d.color})
            
        barGroups.exit()
    }

    function setYear(championship){
        chartContainer.select('#current-date')
            .text(championship.year)
    }
    function updateBarSettings(){
        barHeight = 
                (innerHeight/(yScale.domain().length)) * 0.8 > 100 
                ? 100
                : (innerHeight/(yScale.domain().length)) * 0.8;
    }
    function updateDataset(latestChampionship){

        if(!dataset.map(({name}) => name).includes(latestChampionship.name)){
            let color;
            TeamColors.forEach(team => {
                if (team.name === latestChampionship.name)
                    color = team.color;
            })
            dataset.push({name: latestChampionship.name, titles: 0, lastTitleYear: 0, color: color})

            updateBarSettings();
        }
        
        dataset.forEach(team => {
            if(team.name === latestChampionship.name){
                team.titles++;
                team.lastTitleYear = latestChampionship.year;
            }
        });

        if(latestChampionship["nameChanges"] !== undefined){
            changeName(latestChampionship.nameChanges)
            changeColor(latestChampionship.nameChanges)
        }
        sortDataset()
    }

    function sortDataset(){
        dataset.sort(
            function(a,b){
                return a.titles !== b.titles
                    ? b.titles - a.titles
                    : a.lastTitleYear - b.lastTitleYear 
            }
        )
    }
    function changeColor(nameChanges){
        nameChanges.forEach(change => {
                let a;
                let nombre = change.to;
                let colors = TeamColors.filter(({name}) => name === nombre)[0]
                dataset.forEach(team =>{
                    nombre === team.name
                        ? team.color=colors.color
                        : a=1;
                })

            }
        )
    }
    function changeName(nameChanges){
        nameChanges.forEach(nameChange =>{
            dataset.forEach(team => {
                if(team.name === nameChange.from){
                    team.name = nameChange.to;
                    return;
                }
            })
        })
        
    }

    function setDomains(){
        xScale.domain([0, dataset[0].titles]);
        yScale.domain(dataset.map(({name}) => name));
    }

    function transitionScales(transition){
        yAxis.transition(transition)
            .call(axisLeft(yScale))
        xAxis.transition(transition)
            .call(
                axisTop(xScale)
                    .ticks(max([1,dataset[0].titles/2]))
                    .tickSize(-innerHeight)
            )
    }

    return{
        render
    }
}