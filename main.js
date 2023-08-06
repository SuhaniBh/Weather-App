const API_KEY = "a0a36bb9afdc391a697020f859d07943";
const DAYS_OF_THE_WEEK = ["sun", "mon", "tues", "wed", "thurs", "fri", "sat"];

const getCurrentWeatherData = async()=>{
    const city= "mumbai";
    const response= await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
    return response.json()
}

const getHourlyForecast = async({name : city})=>{
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
    const data = await response.json();
    return data.list.map(forecast=>{
    const {main:{temp, temp_max, temp_min}, dt, dt_txt, weather:[{description,icon}]}=forecast;
    return {temp, temp_max, temp_min, dt, dt_txt, description, icon}  
    })
}

const formatTemperature = (temp) => `${temp?.toFixed(1)}°`;
const createIconUrl = (icon) => `https://openweathermap.org/img/wn/${icon}@2x.png`

const loadCurrentForecast = ({name, main:{temp, temp_max, temp_min}, weather:[{description}] })=>{
   const currentForecastElement = document.querySelector("#Current-Forecast");
   currentForecastElement.querySelector(".city").textContent = name;
   currentForecastElement.querySelector(".temp").textContent = formatTemperature(temp);
   currentForecastElement.querySelector(".desc").textContent = description;
   currentForecastElement.querySelector(".min-max").textContent = `H:${formatTemperature(temp_max)} L:${formatTemperature(temp_min)}`;
}

const loadHourlyForecast = (hourlyForecast)=>{
    console.log(hourlyForecast);
    let dataFor12Hours = hourlyForecast.slice(1 , 13);
    const hourlyContainer = document.querySelector(".hourly-container");
    let innerHTMLString=``;

    for (let {temp, icon, dt_txt} of dataFor12Hours){
           innerHTMLString += `<article>
           <h3 class="time">${dt_txt .split(" ")[1]}</h3>
           <img class="icon" src="${createIconUrl(icon)}" />
           <p class="hourly-temp">${formatTemperature(temp)}</p>
       </article>`
    }
    hourlyContainer .innerHTML = innerHTMLString;
}

const calculateDayWiseForecast = (hourlyForecast) =>{
    let dayWiseForecast = new Map();
    for(let forecast of hourlyForecast){
        const [date] = forecast.dt_txt.split(" ");
        const dayOfTheWeek = DAYS_OF_THE_WEEK[new Date().getDate()]
        console.log(dayOfTheWeek);
        if(dayWiseForecast.has(dayOfTheWeek)){
            let forecastForTheDay = dayWiseForecast.get(dayOfTheWeek);
            forecastForTheDay.push(forecast)
            dayWiseForecast.set(dayOfTheWeek, forecastForTheDay);
        }else{
            dayWiseForecast.set(dayOfTheWeek, [forecast]);
        }
    }
    console.log(dayWiseForecast);
    for(let [key, value] of dayWiseForecast){
        let temp_min = Math.min(...Array.from(value, val=> val.temp_min));
        let temp_max = Math.max(...Array.from(value, val=> val.temp_max));
        
        dayWiseForecast.set(key, {temp_min, temp_max, icon: value.find(v=> v.icon).icon})
    }
    console.log(dayWiseForecast);
    return dayWiseForecast;
}

const loadFiveDayForecast = ({main:[{hourlyForecast}]}) =>{
    console.log(hourlyForecast);
    const dayWiseForecast = calculateDayWiseForecast(hourlyForecast);
    const container = document.querySelector(".five-day-forecast-container");
    let dayWiseInfo = "";
    Array.from(dayWiseForecast).map(([key, {temp_max, temp_min, icon}],index)=>{

        if(index < 5){
        dayWiseInfo += `<article class="day-wise-forecast">
        <h3 class="day">${index === 0? "today": day}</h3>
        <img class="icon" src="${createIconUrl(icon)}" alt="icon for the forecast"/>
        <p class="min-temp">${formatTemperature (temp_min)}</p>
        <p class="max-temp">${formatTemperature (temp_max)}</p>
    </article>`;
        }
    });

    container.innerHTML = dayWiseInfo;
}

const loadFeelsLike = ({main:{feels_like}}) =>{
    let container = document.querySelector("#feels-Like");
    container.querySelector(".feels-like-temp").textContent = formatTemperature(feels_like);
}

const loadHumidity = ({main:{humidity}}) =>{
    let container = document.querySelector("#Humidity");
    container.querySelector(".humidity-value").textContent = `${humidity} %`;
}

document.addEventListener("DOMContentLoaded", async()=>{
     const currentWeather = await getCurrentWeatherData();
     loadCurrentForecast(currentWeather);

     const hourlyForecast = await getHourlyForecast(currentWeather);
     loadHourlyForecast(hourlyForecast);

     loadFiveDayForecast(hourlyForecast);

     loadFeelsLike(currentWeather);

     loadHumidity(currentWeather);
}) 