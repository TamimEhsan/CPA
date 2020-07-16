google.charts.load('current', {
        'packages':['geochart'],
        // Note: you will need to get a mapsApiKey for your project.
        // See: https://developers.google.com/chart/interactive/docs/basic_load_libs#load-settings
        'mapsApiKey': 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY'
      });
      google.charts.setOnLoadCallback(drawRegionsMap);

async	function drawRegionsMap() {
		const api_url = "https://o4qqcaphlj.execute-api.ap-south-1.amazonaws.com/demo?fbclid=IwAR2HUAaUx6rWNpo4WQihJl8Y_ThsLihG_X9T0IXdRyp0QAw9Fj02AbKihzI";
		const response = await fetch(api_url);
		//console.log(response);
		
		const datam = await response.json();
		
		var count = datam.data.length;
		
		var datatoshow = [];
		var ara = ['Country','Users'];
		datatoshow.push(ara);
		for(i = 0;i<count;i++){
			datatoshow.push(datam.data[i]);
		}
        var mapdata = google.visualization.arrayToDataTable(datatoshow);

        var options = {
			colorAxis: {colors: [ '#42bcf5','#4251f5']},//#fce803 
			width:900,
			height:500
		};

        var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));
        chart.draw(mapdata, options);
      }