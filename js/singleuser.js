const base_api_url="https://codeforces.com/api/";
var cresponse ;
var cdata ;
var ratingGraph;
var submissionGraph;
var tagsGraph;
var problemGraph;
//========================================\\



      



//-----------------------------------------\\

async function getData(){
	// Getting Handle and checking if that is a valid one
	var handle = document.getElementById("handle").value;
	const api_url = 'https://codeforces.com/api/user.info?handles='+handle;
	const contest_url = "https://codeforces.com/api/user.rating?handle="+handle;
	const response = await fetch(api_url);
	const data = await response.json();
	
	document.getElementById("error").textContent = "";
	if(data.status!="OK") {
		document.getElementById("error").textContent = "Not a valid handle!";
		return;
	}
	
	// Hiding World Map and showing all others
	//document.getElementById("firstToShow").style.display = "none";
	document.getElementById("hiddendiv").style.display = "block";
	
	// Populating User Table
	document.getElementById("userTable").innerHTML="";
	//addTableRow("userTable","Handle",data.result[0].handle);
	var name = "";
	if(typeof data.result[0].firstName!= "undefined") name = name+ data.result[0].firstName+" ";
	if(typeof data.result[0].lastName!= "undefined") name = name+ data.result[0].lastName;

	addTableRow("userTable","Name",name);
	if(typeof data.result[0].country != "undefined" )
		addTableRow("userTable","Country",data.result[0].country);
	addTableRow("userTable","Rating",data.result[0].rating);
	addTableRow("userTable","Max Rating",data.result[0].maxRating);
	addTableRow("userTable","Friend of",data.result[0].friendOfCount);
	addTableRow("userTable","Contribution",data.result[0].contribution );
	document.getElementById("dp").src = "https:"+data.result[0].titlePhoto;
	
	// Asking Contest objects for rating chart
	cresponse = await fetch(contest_url);
	cdata = await cresponse.json();
	if(cdata.status == "OK"){
		changeRatingChart();
	}
	// Poplulating contest Table
	document.getElementById("contestTable").innerHTML="";
	var maxChange = -10e5, minChange = 10e5, maxRank = -10e5, minRank = 10e5;
	for(i=0;i<cdata.result.length;i++){
		if(i==0){
			maxChange = Math.max(maxChange, cdata.result[i].newRating-1500);
			minChange = Math.min(minChange, cdata.result[i].newRating-1500);
		}
		else{
			maxChange = Math.max(maxChange, cdata.result[i].newRating-cdata.result[i].oldRating);
			minChange = Math.min(minChange, cdata.result[i].newRating-cdata.result[i].oldRating);
		}
		maxRank = Math.max(maxRank, cdata.result[i].rank);
		minRank = Math.min(minRank, cdata.result[i].rank);
	}
	addTableRow("contestTable","Total Contest",cdata.result.length);
	addTableRow("contestTable","Best Rank",minRank);
	addTableRow("contestTable","Worst Rank",maxRank);
	addTableRow("contestTable","Max Rating Change",maxChange);
	addTableRow("contestTable","Min Rating Change",minChange);
	addTableRow("contestTable","Rank",data.result[0].rank);
	addTableRow("contestTable","Max Rank",data.result[0].maxRank);
	
	// Asking for submission objects
	const sresponse = await fetch(base_api_url+"user.status?handle="+handle);
	const submission_data = await sresponse.json();
	var count = submission_data.result.length;
	var ac = 0, ce = 0 ,wa = 0, tle = 0, rte = 0, mle = 0, others = 0;
	var ara = [];
	var mxpr = 0;
	var strongTags = [], weakTags = [];
	
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
		var tags = submission_data.result[i].problem.tags;
	
		if(verdict == "OK" ){
			strongTags = strongTags.concat(tags);
		}else{
			weakTags = weakTags.concat(tags);
		}
		
	}
	
	strongTags.sort();
	weakTags.sort();
	//console.log(strongTags.length);
	
	// Listing all tags by number
	var toptenWeak = [], toptenStrong = [];
	var lasts = 0, lastw = 0;
	for(i = 1;i<strongTags.length;i++){
		if(strongTags[i]!=strongTags[i-1]){
			var numb = i-lasts;
			var temp = [strongTags[i-1]+": "+numb ,i-lasts];
			lasts = i;
			toptenStrong.push(temp);
		}
		if(weakTags[i]!=weakTags[i-1]){
			var numb = i-lastw
			var temp = [weakTags[i-1]+": "+numb,i-lastw];
			lastw = i;
			toptenWeak.push(temp);
		}
	}
	toptenStrong.sort(sortFunction);
	toptenWeak.sort(sortFunction);
	function sortFunction(a, b) {
		if (a[1] === b[1]) {
			return 0;
		}
		else {
			return (a[1] > b[1]) ? -1 : 1;
		}
	}
	
	var tagsToAdd = "";
	for(i = 0; i<10;i++){
		tagsToAdd = tagsToAdd.concat("<span style=\"float:left\">"+toptenStrong[i][0]+"</span>");
	}
	document.getElementById("strongTags").innerHTML = tagsToAdd;
	tagsToAdd = "";
	for(i = 0; i<10;i++){
		tagsToAdd = tagsToAdd.concat("<span style=\"float:left\">"+toptenWeak[i][0]+"</span>");
	}
	document.getElementById("weakTags").innerHTML = tagsToAdd;

	
	var dataTags = [["Type","Count"],["AC: "+ac,ac],["WA: "+wa,wa],["CE: "+ce,ce],["RTE: "+rte,rte],["MLE: "+mle,mle],["Others: "+others,others]];
	createDonutChart(dataTags,"submissionchart"); /*here*/
	
	var para = [["Tags","Solved"]];
	para = para.concat(toptenStrong);
	console.log(para[1][0]);
	createDonutChart(para,"donutchart"); /*here*/
	
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
				if(i == 0) datax.push(cdata.result[i].newRating-1500);
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

function createsubmissionchart(datalabels,datax,chartType,chartname){
	if(chartname){
		chartname.data.labels = datalabels;
		chartname.data.datasets[0].data = datax;
		chartname.update();
	} else {
		var ctx = document.getElementById(chartType).getContext('2d');
		chartname = new Chart(ctx, {
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
				fullWidth: true,
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero: false
						}
					}]
				}
			}
		});
		ratingGraph.canvas.parentNode.style.width = '1000px';
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

function createDonutChart(datatoshow,chartName){
	google.charts.load("current", {packages:["corechart"]});
      google.charts.setOnLoadCallback(drawmChart);
      function drawmChart() {
        var data = google.visualization.arrayToDataTable(datatoshow);

        var tagOptions = {
			width: Math.max(600, $('.contents').width()),
			height: Math.max(600, $('.contents').width()) * 0.70,
			chartArea: { width: '80%', height: '70%' },
			pieSliceText: 'none',
			legend: {
			  position: 'right',
			  alignment: 'center',
			  textStyle: {
				fontSize: 12,
				fontName: 'Roboto'
			  }
			},
			pieHole: 0.5,
			tooltip: {
			  text: 'percentage'
			},
			fontName: 'Roboto',
			
		  };

        var chart = new google.visualization.PieChart(document.getElementById(chartName));
        chart.draw(data, tagOptions);

	}
}


function addTableRow(name,data1,data2){
	var table = document.getElementById(name);

// Create an empty <tr> element and add it to the 1st position of the table:
var row = table.insertRow();

// Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
var cell1 = row.insertCell(0);
var cell2 = row.insertCell(1);

// Add some text to the new cells:
cell1.innerHTML = data1;
cell2.innerHTML = data2;
}
		
