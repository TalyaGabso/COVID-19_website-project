//API and Proxy
const proxy = "https://api.codetabs.com/v1/proxy/?quest=";
//countries by region
const countriesBasePoint = "https://restcountries.herokuapp.com/api/v1/";
//covid stats by location
const covidBasePoint = "http://corona-api.com/countries";

//----------data variables----------//
let covidByCountry = [];
let countries = [];
let countriesByRegion = [];

//--------------------fetch data function--------------------//
//returns an object of region, each contains the countries within the region (with values of:name, code, region)
async function fetchCountries() {
	const response = await fetch(proxy + countriesBasePoint);
	const data = await response.json();

	countries = data
		.map((country) => ({
			code: country.cca2,
			name: country.name.common,
			region: country.region,
		}))
		.reduce((obj, next) => {
			// for countries that has a region specified create a new one or push to an existing one
			if (next.region) {
				if (!obj[next.region]) {
					obj[next.region] = [];
				}
				obj[next.region].push(next);
			}
			return obj;
		}, {});

	// create buttons
	createRegionBtn(countries);
}
//return a new array with the data for each country
async function fetchStat() {
	const response = await fetch(proxy + covidBasePoint);
	const res = await response.json();
	const data = res.data;

	covidByCountry = data.map((country) => ({
		code: country.code,
		name: country.name,
		today: {
			confirmed: country.today.confirmed,
			deaths: country.today.deaths,
		},
		total: {
			cases: country.latest_data.confirmed,
			deaths: country.latest_data.deaths,
			critical: country.latest_data.critical,
			recovered: country.latest_data.recovered,
		},
	}));

	return covidByCountry;
}

//--------------------create elements--------------------//
// create data type buttons
function createBtnElement(type) {
	let newBtn = document.createElement("button");
	newBtn.classList.add("dataTypeBtn");
	newBtn.setAttribute("data-type", `${type}`);
	newBtn.innerHTML = `${type}`;

	let displayDataTypeBtn = document.querySelector(".byDataType");
	displayDataTypeBtn.appendChild(newBtn);

	newBtn.addEventListener("click", clickDataType);
}
createBtnElement("Confirmed");
createBtnElement("Recovered");
createBtnElement("Critical");
createBtnElement("Deaths");
function clickDataType(event){
    console.log(event);
}
// create a new button for each object key
function createRegionBtn(obj) {
	for (const [key] of Object.entries(obj)) {
		// console.log(`var ${key}`);
		let newBtn = document.createElement("button");
		newBtn.classList.add("regionBtn");
		newBtn.setAttribute("data-region-name", `${key}`);
		newBtn.innerHTML = `${key}`;

		let displayRegionBtn = document.querySelector(".byRegion");
		displayRegionBtn.appendChild(newBtn);

		newBtn.addEventListener("click", clickRegion);
	}
    
}
//---------------clicked fcallbacks---------------//
//display statistcs graph of the region clicked
async function clickRegion(event) {
	//based on click create a new array with the region countries
	let region = event.target.getAttribute("data-region-name");
	let countriesList = countries[region];
	createCountryDropdown(countriesList);

	let data = await fetchStat();
	let names = [];
	let numbers = [];

	countriesList.forEach((country) => {
		let myData = data.find((x) => x.code == country.code);
		//if theres the country code in covid stats and countries list add the data to the array
		if (myData) {
			numbers.push(myData.total.cases);
			names.push(country.name);
		}
	});
	//add data type to graph
	creatNewChart(names, numbers, "cases", `${region}`);
}



//create a dropdown menu when clicked on region
function createCountryDropdown(list) {
	let element = document.querySelector(".byCountry");
	// remove the previous list
	element.childNodes.forEach((child) => {
		child.remove();
	});
	let select = document.createElement("select");
	select.classList.add("country-list");

	let titleOption = document.createElement("option");
	titleOption.innerHTML = "Select a country";
	select.appendChild(titleOption);

	list.forEach((item) => {
		let option = document.createElement("option");
		option.text = item.name;
		option.value = item.code;
		select.appendChild(option);
	});
	select.addEventListener("change", countrySelect);
	element.appendChild(select);
}
// covid statistics for a selected country
async function countrySelect() {
	let countryList = document.querySelector(".country-list");
	let selected = countryList.value;
	console.log(selected);
	let data = await fetchStat();
	let country = data.find((x) => (x.code = selected));
	console.log(country);
}

//--------------------Graph function--------------------//
function creatNewChart(countries, numberOfCases, covidData, region) {
	var ctx = document.getElementById("myChart").getContext("2d");
	var myChart = new Chart(ctx, {
		type: "line",
		data: {
			labels: countries,
			datasets: [
				{
					label: `${covidData} in ${region}`,
					data: numberOfCases,
					backgroundColor: "#1d2d506e",
					borderColor: "#133b5c",
					borderWidth: "1",
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			scales: {
				yAxes: [
					{
						ticks: {
							beginAtZero: true,
						},
					},
				],
			},
		},
	});
	// chosenRegion = 'world'
	return myChart;
}

fetchCountries();
fetchStat();
