//Desarrollo de las visualizaciones
import * as d3 from 'd3';
//import { numberWithCommas2 } from './helpers';
//import { getInTooltip, getOutTooltip, positionTooltip } from './modules/tooltip';
import { setChartHeight } from '../modules/height';
import { setChartCanvas, setChartCanvasImage } from '../modules/canvas-image';
import { setRRSSLinks } from '../modules/rrss';
import { setFixedIframeUrl } from './chart_helpers';

//Colores fijos
const COLOR_PRIMARY_1 = '#F8B05C', 
COLOR_PRIMARY_2 = '#E37A42',
COLOR_COMP_1 = '#528FAD', 
COLOR_COMP_2 = '#AADCE0',
COLOR_GREY_1 = '#D6D6D6', 
COLOR_GREY_2 = '#A3A3A3',
COLOR_ANAG__PRIM_1 = '#BA9D5F', 
COLOR_ANAG_PRIM_2 = '#9E6C51',
COLOR_ANAG_PRIM_3 = '#9E3515',
COLOR_ANAG_COMP_1 = '#1C5A5E';

export function initChart(iframe) {
    //Lectura de datos
    d3.csv('https://raw.githubusercontent.com/CarlosMunozDiazCSIC/informe_perfil_mayores_2022_salud_2_11/main/data/edades_quinquenales_salud_percibida_v2.csv', function(error,data) {
        if (error) throw error;
        
        let dataFiltered = data.filter(function(item) {
            if (item.Edad != 'TOTAL' && item.Sexo != 'Ambos sexos' && item['Estado de salud'] != 'Total') {
                return item;
            }
        });

        let margin = {top: 10, right: 10, bottom: 50, left: 30},
            width = document.getElementById('chart').clientWidth - margin.left - margin.right,
            height = document.getElementById('chart').clientHeight - margin.top - margin.bottom;

        let svg = d3.select("#chart")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

        let x0 = d3.scaleBand()
            .domain(d3.map(dataFiltered, function(d){ return d.Edad; }).keys())
            .range([ 0, width ]);            
            
        let x1 = d3.scaleBand()
            .domain(['H','M'])
            .rangeRound([0, x0.bandwidth()])
            .padding(0.2);

        svg.append("g")
            .attr("transform", "translate(0," + (height + 25) + ")")
            .call(d3.axisBottom(x0));

        for(let i = 0; i < 8; i++) {
            svg.append("g")
                .attr("transform", "translate(" + x0.bandwidth() * i  + "," + (height + 0) + ")")
                .call(d3.axisBottom(x1));   
        }        
    
        // Add Y axis
        let y = d3.scaleLinear()
            .domain([0, 100])
            .range([ height, 0 ]);
        svg.append("g")
            .call(d3.axisLeft(y));

        let z = d3.scaleOrdinal()
            .domain(d3.map(dataFiltered, function(d){ return d['Estado de salud']; }).keys().reverse())
            .range([COLOR_PRIMARY_2, COLOR_PRIMARY_1, COLOR_GREY_1, COLOR_COMP_2, COLOR_COMP_1]);

        let groupData = d3.nest()
            .key(function(d) { return d.Sexo + d.Edad; })
            .rollup(function(d, i){            
                let d2 = {Sexo: d[0].Sexo, Edad: d[0].Edad}
                d.forEach(function(d){
                    d2[d['Estado de salud']] = +d.Valor
                });
            return d2;
        })
        .entries(dataFiltered).map(function(d){ return d.value; });
        
        let stackData = d3.stack()
            .keys(z.domain())
            (groupData);

        let serie = svg.selectAll(".serie")
            .data(stackData)
            .enter()
            .append("g")
            .attr("class", "serie")
            .attr("fill", function(d) { return z(d.key); });

        function init() {  
            serie.selectAll("rect")
                .data(function(d) { return d; })
                .enter()
                .append("rect")
                .attr("class", "serie-rect")
                .attr("transform", function(d) { return "translate(" + x0(d.data.Edad) + ",0)"; })
                .attr("x", function(d) { return x1(d.data.Sexo); })
                .attr("y", function(d) { return y(0); })
                .attr("height", function(d) { return 0; })
                .attr("width", x1.bandwidth())
                .transition()
                .duration(2000)
                .attr("y", function(d) { return y(d[1]); })
                .attr("height", function(d) { return y(d[0]) - y(d[1]); })
        }

        function animateChart() {
            serie.selectAll(".serie-rect")
                .attr("transform", function(d) { return "translate(" + x0(d.data.Edad) + ",0)"; })
                .attr("x", function(d) { return x1(d.data.Sexo); })
                .attr("y", function(d) { return y(0); })
                .attr("height", function(d) { return 0; })
                .attr("width", x1.bandwidth())
                .transition()
                .duration(2000)
                .attr("y", function(d) { return y(d[1]); })
                .attr("height", function(d) { return y(d[0]) - y(d[1]); })
        }

        //////
        ///// Resto - Chart
        //////
        init();

        //Animación del gráfico
        document.getElementById('replay').addEventListener('click', function() {
            animateChart();
        });

        //////
        ///// Resto
        //////

        //Iframe
        setFixedIframeUrl('informe_perfil_mayores_2022_salud_2_11','distribucion_estado_salud_percibida');

        //Redes sociales > Antes tenemos que indicar cuál sería el texto a enviar
        setRRSSLinks('distribucion_estado_salud_percibida');

        //Captura de pantalla de la visualización
        setChartCanvas();      

        let pngDownload = document.getElementById('pngImage');

        pngDownload.addEventListener('click', function(){
            setChartCanvasImage('distribucion_estado_salud_percibida');
        });

        //Altura del frame
        setChartHeight(iframe);
    });


    
}