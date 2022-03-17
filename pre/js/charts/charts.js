//Desarrollo de las visualizaciones
import * as d3 from 'd3';
//import { numberWithCommas2 } from './helpers';
//import { getInTooltip, getOutTooltip, positionTooltip } from './modules/tooltip';
import { setChartHeight } from '../modules/height';
import { setChartCanvas, setChartCanvasImage, setCustomCanvas, setChartCustomCanvasImage } from '../modules/canvas-image';
import { setRRSSLinks } from '../modules/rrss';
import { setFixedIframeUrl } from './chart_helpers';

//Colores fijos
const COLOR_PRIMARY_1 = '#F8B05C', 
COLOR_PRIMARY_2 = '#E37A42', 
COLOR_ANAG_1 = '#D1834F', 
COLOR_ANAG_2 = '#BF2727', 
COLOR_COMP_1 = '#528FAD', 
COLOR_COMP_2 = '#AADCE0', 
COLOR_GREY_1 = '#B5ABA4', 
COLOR_GREY_2 = '#64605A', 
COLOR_OTHER_1 = '#B58753', 
COLOR_OTHER_2 = '#731854';

export function initChart(iframe) {
    //Lectura de datos
    d3.csv('https://raw.githubusercontent.com/CarlosMunozDiazCSIC/informe_perfil_mayores_2022_salud_2_11/main/data/edades_quinquenales_salud_percibida_v2.csv', function(error,data) {
        if (error) throw error;
        
        let dataFiltered = data.filter(function(item) {
            if (item.Edad != 'TOTAL' && item.Sexo != 'Ambos sexos') {
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
            .range([COLOR_PRIMARY_2, COLOR_PRIMARY_1, COLOR_GREY_1, COLOR_COMP_2, COLOR_COMP_1]);
        

        function init() {

        }

        function animateChart() {

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
        setCustomCanvas();

        let pngDownload = document.getElementById('pngImage');

        pngDownload.addEventListener('click', function(){
            setChartCanvasImage('distribucion_estado_salud_percibida');
            setChartCustomCanvasImage('distribucion_estado_salud_percibida');
        });

        //Altura del frame
        setChartHeight(iframe);
    });


    
}