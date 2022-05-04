//Desarrollo de las visualizaciones
import * as d3 from 'd3';
import { numberWithCommas3 } from '../helpers';
import { getInTooltip, getOutTooltip, positionTooltip } from '../modules/tooltip';
import { setChartHeight } from '../modules/height';
import { setChartCanvas, setChartCanvasImage } from '../modules/canvas-image';
import { setRRSSLinks } from '../modules/rrss';
import { setFixedIframeUrl } from './chart_helpers';

//Colores fijos
const COLOR_PRIMARY_1 = '#F8B05C', 
COLOR_PRIMARY_2 = '#E37A42',
COLOR_COMP_1 = '#528FAD', 
COLOR_COMP_2 = '#AADCE0',
COLOR_GREY_1 = '#A3A3A3';
let tooltip = d3.select('#tooltip');

//Diccionario
let dictionary = {
    0: 'Muy mala',
    1: 'Mala',
    2: 'Regular',
    3: 'Buena',
    4: 'Muy buena'
};

export function initChart() {
    //Lectura de datos
    d3.csv('https://raw.githubusercontent.com/CarlosMunozDiazCSIC/informe_perfil_mayores_2022_salud_2_11/main/data/edades_quinquenales_salud_percibida_v3.csv', function(error,data) {
        if (error) throw error;
        
        //Filtrado de datos
        let dataFiltered = data.filter(function(item) {
            if (item.Edad != 'TOTAL' && item.Sexo != 'Ambos sexos') {
                return item;
            }
        });

        let dataMen = dataFiltered.filter(function(item) {
            if (item.Sexo == 'H') {
                return item;
            }
        });

        let dataWomen = dataFiltered.filter(function(item) {
            if (item.Sexo == 'M') {
                return item;
            }
        });

        let grupos = ['muy_mala','mala','regular','buena','muy_buena'];

        //Visualización
        let margin = {top: 12.5, right: 10, bottom: 25, left: 32.5},
            width = document.getElementById('bars--first').clientWidth - margin.left - margin.right,
            height = document.getElementById('bars--first').clientHeight - margin.top - margin.bottom;

        let chart1 = d3.select("#bars--first")
            .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        let chart2 = d3.select("#bars--second")
            .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //EJES X
        let x = d3.scaleBand()
            .domain(d3.map(dataFiltered, function(d){ return d.Edad; }).keys())
            .range([0, width]);

        let xAxis = function(g) {
            g.call(d3.axisBottom(x));
            
            g.call(function(g){g.selectAll('.tick line').remove()});
            g.call(function(g){g.select('.domain').remove()});
        }
        
        chart1.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        chart2.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);   
    
        //Eje Y
        let y = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);

        let yAxis = function(g) {
            g.call(d3.axisLeft(y).ticks(5));
            g.selectAll('.tick line')
                .attr('class', function(d,i) {
                    if (d == 0) {
                        return 'line-special';
                    }
                })
                .attr('x1', '0')
                .attr('x2', `${width}`);
        }

        chart1.append("g")
            .attr("class", "yaxis")
            .call(yAxis);

        chart2.append("g")
            .attr("class", "yaxis")
            .call(yAxis);

        //COLORES
        let color = d3.scaleOrdinal()
            .domain(grupos)
            .range([COLOR_PRIMARY_2, COLOR_PRIMARY_1, COLOR_GREY_1, COLOR_COMP_2, COLOR_COMP_1]);

        let stackDataMen = d3.stack()
            .keys(color.domain())
            (dataMen);

        let stackDataWomen = d3.stack()
            .keys(color.domain())
            (dataWomen);

        console.log(dataMen, stackDataMen);

        function init() {  
            chart1.append("g")
                .attr('class','chart-g-1')
                .selectAll("g")
                .data(stackDataMen)
                .enter()
                .append("g")
                .attr("fill", function(d) { return color(d.key); })
                .attr('class', function(d) {
                    return 'rect-padre-1 ' + d.key;
                })
                .selectAll("rect")
                .data(function(d) { return d; })
                .enter()
                .append("rect")
                .attr('class', 'rect-1')
                .attr("x", function(d) { return x(d.data.Edad); })
                .attr("y", function(d) { return y(0); })
                .attr("height", function(d) { return 0; })
                .attr("width",x.bandwidth())
                .on('mouseover', function(d,i,e) {
                    //Opacidad de las barras
                    let current = this.parentNode.classList[1];
                    let other_1 = chart1.selectAll('.rect-1');
                    let other_2 = chart2.selectAll('.rect-2');
                    let _this_1 = chart1.selectAll(`.${current.split('_')[0]}_hombres`); //Elemento padre
                    let _thisChilds_1 = _this_1.selectAll('.rect-1');
                    let _this_2 = chart2.selectAll(`.${current.split('_')[0]}_mujeres`); //Elemento padre
                    let _thisChilds_2 = _this_2.selectAll('.rect-2');
                    
                    other_1.each(function() {
                        this.style.opacity = '0.2';
                    });
                    other_2.each(function() {
                        this.style.opacity = '0.2';
                    });
                    _thisChilds_1.each(function() {
                        this.style.opacity = '1';
                    });
                    _thisChilds_2.each(function() {
                        this.style.opacity = '1';
                    });

                    //Texto                    
                    let html = '<p class="chart__tooltip--title">Salud percibida: ' + dictionary[currentType.split('-')[1]] + '</p>' + 
                        '<p class="chart__tooltip--text">Un <b>' + numberWithCommas3(d.data[dictionary[currentType.split('-')[1]]]) + '%</b> de hombres en el grupo de edad <b>' + d.data.Edad + '</b> perciben que su salud es <b>' + dictionary[currentType.split('-')[1]].toLowerCase() +'</b></p>';
                    
                    tooltip.html(html);

                    //Tooltip
                    positionTooltip(window.event, tooltip);
                    getInTooltip(tooltip);

                })
                .on('mouseout', function(d,i,e) {
                    //Quitamos los estilos de la línea
                    let bars_1 = chart1.selectAll('.rect-1');
                    let bars_2 = chart2.selectAll('.rect-2');
                    bars_1.each(function() {
                        this.style.opacity = '1';
                    });
                    bars_2.each(function() {
                        this.style.opacity = '1';
                    });
                
                    //Quitamos el tooltip
                    getOutTooltip(tooltip); 
                })
                .transition()
                .duration(2000)
                .attr("y", function(d) { return y(d[1]); })
                .attr("height", function(d) { return y(d[0]) - y(d[1]); });

            chart2.append("g")
                .attr('class','chart-g-2')
                .selectAll("g")
                .data(stackDataWomen)
                .enter()
                .append("g")
                .attr("fill", function(d) { return color(d.key); })
                .attr('class', function(d) {
                    return 'rect-padre-2 ' + d.key;
                })
                .selectAll("rect")
                .data(function(d) { return d; })
                .enter()
                .append("rect")
                .attr('class','rect-2')
                .attr("x", function(d) { return x(d.data.Edad); })
                .attr("y", function(d) { return y(0); })
                .attr("height", function(d) { return 0; })
                .attr("width",x.bandwidth())
                .on('mouseover', function(d,i,e) {
                    //Opacidad de las barras
                    let current = this.parentNode.classList[1];
                    let other_1 = chart1.selectAll('.rect-1');
                    let other_2 = chart2.selectAll('.rect-2');
                    let _this_1 = chart1.selectAll(`.${current.split('_')[0]}_hombres`); //Elemento padre
                    let _thisChilds_1 = _this_1.selectAll('.rect-1');
                    let _this_2 = chart2.selectAll(`.${current.split('_')[0]}_mujeres`); //Elemento padre
                    let _thisChilds_2 = _this_2.selectAll('.rect-2');
                    
                    other_1.each(function() {
                        this.style.opacity = '0.2';
                    });
                    other_2.each(function() {
                        this.style.opacity = '0.2';
                    });
                    _thisChilds_1.each(function() {
                        this.style.opacity = '1';
                    });
                    _thisChilds_2.each(function() {
                        this.style.opacity = '1';
                    });

                    //Texto                    
                    let html = '<p class="chart__tooltip--title">Salud percibida: ' + dictionary[currentType.split('-')[1]] + '</p>' + 
                        '<p class="chart__tooltip--text">Un <b>' + numberWithCommas3(d.data[dictionary[currentType.split('-')[1]]]) + '%</b> de mujeres en el grupo de edad <b>' + d.data.Edad + '</b> perciben que su salud es <b>' + dictionary[currentType.split('-')[1]].toLowerCase() +'</b></p>';
                    
                    tooltip.html(html);

                    //Tooltip
                    positionTooltip(window.event, tooltip);
                    getInTooltip(tooltip);
                })
                .on('mouseout', function(d,i,e) {
                    //Quitamos los estilos de la línea
                    let bars_1 = chart1.selectAll('.rect-1');
                    let bars_2 = chart2.selectAll('.rect-2');
                    bars_1.each(function() {
                        this.style.opacity = '1';
                    });
                    bars_2.each(function() {
                        this.style.opacity = '1';
                    });
                
                    //Quitamos el tooltip
                    getOutTooltip(tooltip); 
                })
                .transition()
                .duration(2000)
                .attr("y", function(d) { return y(d[1]); })
                .attr("height", function(d) { return y(d[0]) - y(d[1]); });
        }

        function animateChart() {
            chart1.selectAll('.rect-1')
                .attr("x", function(d) { return x(d.data.Edad); })
                .attr("y", function(d) { return y(0); })
                .attr("height", function(d) { return 0; })
                .attr("width",x.bandwidth())
                .transition()
                .duration(2000)
                .attr("y", function(d) { return y(d[1]); })
                .attr("height", function(d) { return y(d[0]) - y(d[1]); });

            chart2.selectAll('.rect-2')
                .attr("x", function(d) { return x(d.data.Edad); })
                .attr("y", function(d) { return y(0); })
                .attr("height", function(d) { return 0; })
                .attr("width",x.bandwidth())
                .transition()
                .duration(2000)
                .attr("y", function(d) { return y(d[1]); })
                .attr("height", function(d) { return y(d[0]) - y(d[1]); });
        }

        //////
        ///// Resto - Chart
        //////
        init();

        //Animación del gráfico
        document.getElementById('replay').addEventListener('click', function() {
            animateChart();

            setTimeout(() => {
                setChartCanvas();
            }, 4000);    
        });

        //////
        ///// Resto
        //////

        //Iframe
        setFixedIframeUrl('informe_perfil_mayores_2022_salud_2_11','distribucion_estado_salud_percibida');

        //Redes sociales > Antes tenemos que indicar cuál sería el texto a enviar
        setRRSSLinks('distribucion_estado_salud_percibida');

        //Captura de pantalla de la visualización
        setTimeout(() => {
            setChartCanvas();
        }, 4000);      

        let pngDownload = document.getElementById('pngImage');

        pngDownload.addEventListener('click', function(){
            setChartCanvasImage('distribucion_estado_salud_percibida');
        });

        //Altura del frame
        setChartHeight();
    });    
}