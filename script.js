function loadJSON(name, callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', name, true)
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            callback(xobj.responseText);
        }
    };
    xobj.send(null)
}

function recreateCanvas(canvas, parent, id) {
    if (canvas) {
        // console.log(`Canvas ${id} found...`)
        canvas.parentNode.removeChild(canvas);
        const new_cnvs = document.createElement('canvas');
        new_cnvs.setAttribute('id',id);
        document.querySelector(parent).appendChild(new_cnvs);
    }
}

function loadDataChart(chart, type, label, dataLabel, dataData) {
    var ctx =  document.getElementById(chart).getContext('2d');
    var chartData = {
        type: type,
        data: {
            labels: dataLabel,
            datasets: [{
                label: label,
                data: dataData
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Timestamp'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Value'
                    }
                }]
            }
        }
    };
    if (chart == 'tempChart') {
        var green = 'rgb(47, 117, 50)';
        chartData['data']['datasets'][0]['backgroundColor'] = green;
        chartData['data']['datasets'][0]['borderColor'] = green;
        chartData['options']['scales']['yAxes'][0]['ticks'] = {
            suggestedMin: 25,
            suggestedMax: 35
        }
    } else if (chart == 'pressChart') {
        var red = 'rgb(201, 31, 55)'
        chartData['data']['datasets'][0]['backgroundColor'] = red;
        chartData['data']['datasets'][0]['borderColor'] = red;
    } else {
        var blue = 'rgb(78, 130, 180)'
        chartData['data']['datasets'][0]['backgroundColor'] = blue;
        chartData['data']['datasets'][0]['borderColor'] = blue;
        chartData['options']['scales']['yAxes'][0]['ticks'] = {
            suggestedMin: 25,
            suggestedMax: 75
        }
    }
    var chart = new Chart(ctx, chartData);
}

document.addEventListener('DOMContentLoaded', function() {
    let d = new Date();
    let today = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate()
    document.querySelector('input[type="date"]').value = today;
    document.querySelector('input[type="date"]').setAttribute('max', today)

    document.querySelector("#newData").onsubmit = () => {
        let name = 'climate-' + document.querySelector('input[type="date"]').value + '.json';
        console.log("Loading: " + name);
        loadJSON(name, function(response){
            // Data from JSON file
            let jsonData = JSON.parse(response);
            // Clear table
            var parent = document.getElementById('myData');
            while (parent.hasChildNodes()) {
                parent.removeChild(parent.firstChild);
            }
            // Load data to chart
            datasetLabels = [];
            datasetTemp = [];
            datasetPress = [];
            datasetHumid = [];
            for (let i = 0; i < jsonData['readings'].length; i += 30) {
                datasetTemp[i] = jsonData['readings'][i]['temperature'];
                datasetPress[i] = jsonData['readings'][i]['pressure'];
                datasetHumid[i] = jsonData['readings'][i]['humidity'];
                datasetLabels[i] = jsonData['readings'][i]['timestamp'].split(' ')[1].slice(0, 8);
            }
            // Remove ChartJS previous graph
            recreateCanvas(document.querySelector('#tempChart'), '#temp', 'tempChart');
            recreateCanvas(document.querySelector('#pressChart'), '#pressure', 'pressChart');
            recreateCanvas(document.querySelector('#humidChart'), '#humidity', 'humidChart');
            // Add data to ChartJS
            loadDataChart('tempChart', 'line', 'Temperature', datasetLabels, datasetTemp);
            loadDataChart('pressChart', 'line', 'Pressure', datasetLabels, datasetPress);
            loadDataChart('humidChart', 'line', 'Humidity', datasetLabels, datasetHumid);
            
            // Add data to table
            jsonData['readings'].forEach(element => {
                const t = document.querySelector('#myData');
                const tr = t.insertRow(-1);
                const timestamp = tr.insertCell(0);
                timestamp.innerHTML = element['timestamp'];
                const temp = tr.insertCell(1);
                temp.innerHTML = element['temperature'] + ' C';
                const humid = tr.insertCell(2);
                humid.innerHTML = element['humidity'] + '%';
                const press = tr.insertCell(3);
                press.innerHTML = element['pressure'] + ' Pa';
            });
        });
        return false;
    }
});