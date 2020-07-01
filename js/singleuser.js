const base_api_url="https://codeforces.com/api/";
var cresponse ;
var cdata ;
var ratingGraph;
var submissionGraph;
var problemGraph;
//========================================\\

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
		console.log("idiot");
		var count = datam.data.length;
		console.log(count);
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



//-----------------------------------------\\
async function getData(){
	var handle = document.getElementById("handle").value;
	const api_url = 'https://codeforces.com/api/user.info?handles='+handle;
	const contest_url = "https://codeforces.com/api/user.rating?handle="+handle;
	const response = await fetch(api_url);
	const data = await response.json();
	
	
	
	if(data.status!="OK") return;
	document.getElementById("firstToShow").style.display = "none";
		
	document.getElementById("hiddendiv").style.display = "block";
	
	document.getElementById('ghandle').textContent = document.getElementById("handle").value;
	if( data.status == "OK" ){
		//console.log(data.result.length);
		document.getElementById('name').textContent = data.result[0].handle;
		document.getElementById('rating').textContent = data.result[0].rating;
		document.getElementById("image").textContent = data.result[0].titlePhoto;
		document.getElementById("dp").src = "https:"+data.result[0].titlePhoto;
		
	} else{
		document.getElementById('name').textContent = "Error";
		document.getElementById('rating').textContent = "Error";
	}
	cresponse = await fetch(contest_url);
	cdata = await cresponse.json();
	if(cdata.status == "OK"){
		changeRatingChart();
	}
	
	const sresponse = await fetch(base_api_url+"user.status?handle="+handle);
	const submission_data = await sresponse.json();
	var count = submission_data.result.length;
	var ac = 0;
	var ce = 0;
	var wa = 0;
	var tle = 0;
	var rte = 0;
	var mle = 0;
	var others = 0;
	var ara = [];
	var mxpr = 0;
	for(i=0;i<count;i++){
		var ch = submission_data.result[i].problem.index;
		var ca = "A";
		var dif = ch.charCodeAt(0)-ca.charCodeAt(0);
		
		if(dif>mxpr) mxpr = dif;
		
		if( typeof ara[dif] == "undefined") ara[dif] = 0;
		ara[dif]++;
		//if(dif==11)console.log(i);
		var verdict = submission_data.result[i].verdict;
		if( verdict == "OK" ){ac++;}
		else if( verdict == "WRONG_ANSWER" ){wa++;}
		else if( verdict == "COMPILATION_ERROR") ce++;
		else if( verdict == "TIME_LIMIT_EXCEEDED") tle++;
		else if( verdict == "MEMORY_LIMIT_EXCEEDED") mle++;
		else if( verdict == "RUNTIME_ERROR") rte++;
		else others++;
	}
	document.getElementById("total_submission_span").textContent = count;
	document.getElementById("accepted_count_span").textContent = ac;
	document.getElementById("wrong_answer_count_span").textContent = wa;
	
	var datalabels3 = ["AC","WA","CE","RTE","MLE","Others"];
	var datax3 = [];
	datax3.push(ac,wa,ce,rte,mle,others);
	createsubmissionchart(datalabels3,datax3);
	
	var datalabels4 = [];
	var datax4 = [];
	for(i = mxpr;i>=0;i--){
		if( typeof ara[i] == "undefined") ara[i] = 0;
		const character = String.fromCharCode(i+65);
		datalabels4.push(character);
		datax4.push(ara[i]);
		//console.log(ara[i]);
	}
	createProblemChart(datalabels4,datax4);
	
}

function changeRatingChart(){
	if( typeof cdata == "undefined") return;
	
	const datalabels = [];
		const datax = [];
		const state = document.getElementById("mySelect").value;
		var sstattus = "";
		for(i=0;i<cdata.result.length;i++){
			if(state == "newRating"){
				datax.push(cdata.result[i].newRating);
				sstatus = "Contest Rating Changes";
			}
			else if(state == "changedRating"){
				sstatus = "Contest Changed Rating";
				if(i == 0) datax.push(cdata.result[i].newRating-1400);
				else datax.push(cdata.result[i].newRating-cdata.result[i].oldRating);
			}
			else {
				datax.push(cdata.result[i].rank);
				sstatus = "Contest Rank";
			}
			//console.log(cdata.result[i].newRating-cdata.result[i].oldRating);
			datalabels.push(i+1);
			
		}
		createratingchart(datalabels,datax,sstatus);
}

function createsubmissionchart(datalabels,datax){
	if(submissionGraph){
		submissionGraph.data.labels = datalabels;
		submissionGraph.data.datasets[0].data = datax;
		submissionGraph.update();
	} else {
		var ctx = document.getElementById('submissionChart').getContext('2d');
		submissionGraph = new Chart(ctx, {
			type: 'doughnut',
			
			data: {
				labels: datalabels,
				datasets: [{
					label: 'Total Submission',
					data: datax,
					backgroundColor: [
						'rgba(0, 255, 0, 1)',
						'rgba(255, 0, 0, 1)',
						'rgba(255, 255, 0, 1)',
						'rgba(255, 130, 0, 1)',
						'rgba(130, 0, 255, 1)',
						'rgba(114, 110, 117,1)'
					],
					borderColor: 'rgba(0,0,0, 0.5)',
					
				}]
			},
			options: {
			}
		});
	}
	
}

function createratingchart(datalabels,datax,sstatus){
	if(ratingGraph){
		ratingGraph.data.labels = datalabels;
		ratingGraph.data.datasets[0].data = datax;
		ratingGraph.data.datasets[0].label = sstatus;
		ratingGraph.update();
	}else {
		var ctx = document.getElementById('ratingChart').getContext('2d');
		ratingGraph = new Chart(ctx, {
			type: 'line',
			
			data: {
				labels: datalabels,
				datasets: [{
					label: sstatus,
					data: datax,
					fill: false,
					backgroundColor: 'rgba(0, 0, 0, 1)',
					borderColor: 'rgba(255, 99, 132, 1)',
					borderWidth: 1
				}]
			},
			options: {
				
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero: false
						}
					}]
				}
			}
		});
	}
}

function createProblemChart(datalabels,datax){
	if(problemGraph){
		problemGraph.data.labels = datalabels;
		problemGraph.data.datasets[0].data = datax;
		problemGraph.update();
	} else{
		var ctx = document.getElementById('problemChart').getContext('2d');
		problemGraph = new Chart(ctx, {
			type: 'horizontalBar',
			
			data: {
				labels: datalabels,
				datasets: [{
					label: 'Problem Counts',
					data: datax,
					fill: false,
					backgroundColor: 'rgba(50, 102, 168, 1)',
					borderColor: 'rgba(255, 99, 132, 1)',
					borderWidth: 1
				}]
			},
			options: {
			
			}
		});
	}
}
		
