var cresponse ;
var cdata;
var cresponse2;
var cdata2;
var response;
var data;
var handle1;
var handle2;
async function getDoubleData(){
	handle1 = document.getElementById("handle1").value;
	handle2 = document.getElementById("handle2").value;
	const api_url = 'https://codeforces.com/api/user.info?handles='+handle1+";"+handle2;
	response = await fetch(api_url);
	data = await response.json();
	
	
	document.getElementById("errorDouble").textContent = "";
	if(data.status!="OK") {
		document.getElementById("errorDouble").textContent = "Not a valid handle!";
		return;
	}
	const contest_url1 = "https://codeforces.com/api/user.rating?handle="+handle1;
	const contest_url2 = "https://codeforces.com/api/user.rating?handle="+handle2;
	
	document.getElementById("userTableDouble").innerHTML = "";
	document.getElementById("contestTableDouble").innerHTML = "";
	document.getElementById("commonContestTableDouble").innerHTML = "";
	document.getElementById("hiddenDivDouble").style.display = "block";
	
	
	var name1 = "";
	if(typeof data.result[0].firstName!= "undefined") name1 = name1+ data.result[0].firstName+" ";
	if(typeof data.result[0].lastName!= "undefined") name1 = name1+ data.result[0].lastName;
	
	var name2 = "";
	if(typeof data.result[1].firstName!= "undefined") name2 = name2+ data.result[1].firstName+" ";
	if(typeof data.result[1].lastName!= "undefined") name2 = name2+ data.result[1].lastName;

	addTableRow("userTableDouble","Name",name1,name2);
	addTableRow("userTableDouble","Country",data.result[0].country,data.result[1].country);
	addTableRow("userTableDouble","Rating",data.result[0].rating,data.result[1].rating);
	addTableRow("userTableDouble","Max Rating",data.result[0].maxRating,data.result[1].maxRating);
	addTableRow("userTableDouble","Friend of",data.result[0].friendOfCount,data.result[1].friendOfCount);
	addTableRow("userTableDouble","Contribution",data.result[0].contribution ,data.result[1].contribution);
	
	cresponse = await fetch(contest_url1);
	cdata = await cresponse.json();
	cresponse2 = await fetch(contest_url2);
	cdata2 = await cresponse2.json();
	
	createContestTable(handle1,handle2);
	createCommonContestTable(handle1,handle2);
	
	if (typeof google.visualization == 'undefined') {
		google.charts.setOnLoadCallback(drawContestChart);
	} else {
		drawContestChart();
	}
}

function createContestTable(handle1,handle2){
	// Poplulating contest Table
	document.getElementById("contestTableDouble").innerHTML="";
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
	var maxChange2 = -10e5, minChange2 = 10e5, maxRank2 = -10e5, minRank2 = 10e5;
	for(i=0;i<cdata2.result.length;i++){
		if(i==0){
			maxChange2 = Math.max(maxChange2, cdata2.result[i].newRating-1500);
			minChange2 = Math.min(minChange2, cdata2.result[i].newRating-1500);
		}
		else{
			maxChange2 = Math.max(maxChange2, cdata2.result[i].newRating-cdata2.result[i].oldRating);
			minChange2 = Math.min(minChange2, cdata2.result[i].newRating-cdata2.result[i].oldRating);
		}
		maxRank2 = Math.max(maxRank2, cdata2.result[i].rank);
		minRank2 = Math.min(minRank2, cdata2.result[i].rank);
	}
	addTableRow("contestTableDouble","Handle",handle1,handle2);
	addTableRow("contestTableDouble","Total Contest",cdata.result.length,cdata2.result.length);
	addTableRow("contestTableDouble","Best Rank",minRank,minRank2);
	addTableRow("contestTableDouble","Worst Rank",maxRank,maxRank2);
	addTableRow("contestTableDouble","Max Change",maxChange,maxChange2);
	addTableRow("contestTableDouble","Min Change",minChange,minChange2);
	//addTableRow("contestTableDouble","Rank",data.result[0].rank);
	//addTableRow("contestTableDouble","Max Rank",data.result[0].maxRank);
}
function createCommonContestTable(handle1,handle2){
	var i = 0, j =  0,counter =  0;
	var HP1 = 0, HP2 = 0 , tie = 0;
	while(i<cdata.result.length && j<cdata2.result.length){
		if(cdata.result[i].contestId<cdata2.result[j].contestId) i++;
		else if( cdata.result[i].contestId>cdata2.result[j].contestId ) j++;
		else {
			if(cdata.result[i].rank<cdata2.result[j].rank) HP1++;
			else if(cdata.result[i].rank>cdata2.result[j].rank) HP2++;
			else tie++;
			counter++;
			i++;
			j++;
		}
	}
	addTableRow("commonContestTableDouble","Handle",handle1,handle2);
	addTableRow("commonContestTableDouble","Common",counter,counter);
	addTableRow("commonContestTableDouble","Wins",HP1,HP2);
	//addTableRow("commonContestTableDouble","Losses",counter-HP1-tie,counter-HP2-tie);
	addTableRow("commonContestTableDouble","Ties",tie,tie);
}

function drawContestChart(){
	console.log("fuk Yu");
	var ara = [];
	var para = ["New Rating",handle1,handle2];
	ara.push(para);
	var mx = cdata.result.length;
	if( mx< cdata2.result.length ) mx = cdata2.result.length;
	for(i=0;i<mx;i++){
		var para = [];
		var x = i+1;
		para.push(i+1);
		if(i<cdata.result.length) para.push(cdata.result[i].newRating);
		else para.push(null);
		if(i<cdata2.result.length) para.push(cdata2.result[i].newRating);
		else para.push(null);
		ara.push(para);
	}
	var datas = google.visualization.arrayToDataTable(ara);

        var options = {
          title: 'Contest Performance By the number of contest',
          curveType: 'function',
          legend: { position: 'bottom' }
        };
        var chart = new google.visualization.LineChart(document.getElementById('contestChartDouble'));

        chart.draw(datas, options);
		console.log("fuk Yu 2");

}

function addTableRow(name,topic,data1,data2){
	var table = document.getElementById(name);

// Create an empty <tr> element and add it to the 1st position of the table:
var row = table.insertRow();

// Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
var cell1 = row.insertCell(0);
var cell2 = row.insertCell(1);
var cell3 = row.insertCell(2);

// Add some text to the new cells:
var color1 = ">";
var color2 = ">";
if(typeof data1 == "number"){
	if(data1>data2) {
		color1 = "style=\"background-color: #00ff00;\"> ";
		color2 = "style=\"background-color: #ff0000;\"> ";
	} else if(data2>data1){
		color2 = "style=\"background-color: #00ff00;\"> ";
		color1 = "style=\"background-color: #ff0000;\"> ";
	}
	
}
switch(topic){
	case "Best Rank":
	case "Worst Rank":
		var temp = color1;
		color1 = color2;
		color2 = temp;
}
cell1.innerHTML = topic;
cell2.innerHTML = "<span "+color1+data1+"<//span>";
cell3.innerHTML = "<span "+color2+data2+"<//span>";
}