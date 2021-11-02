const fs = require('fs');
const axios = require('axios');

class Busquedas{
    historial = [];
    dbPath = './db/database.json';

    constructor() {
        this.leerDB();
    }

    get historialCapitalizado(){
        this.historial = this.historial.map((lugar) =>{
            return this.toTitleCase(lugar);
        })
        return this.historial;
    }
    toTitleCase(str) {
        return str.replace(
            /\w\S*/g,
            function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
        );
    }
    get paramsMapBox(){
        return {
                'access_token' : process.env.MAPBOX_KEY,
                'limit': 5,
                'language': 'es'
        }
    }
    async ciudad( lugar = '' ){

        try{
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramsMapBox,
            });

            const resp = await instance.get();
            return resp.data.features.map( lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1],
            }));

        } catch(error){
            return []; //retornar los lugares que coincidan con lugar
        }
    }

    get openWeatherParams(){
        return {
            'appid' : process.env.OPENWEATHER_KEY,
            'lang' : 'es',
            'units' : 'metric',
        }
    }
    async climaLugar( lat, lon){
        try{
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: {...this.openWeatherParams, lat, lon}
            });

            const resp = await instance.get();
            return {
                desc: resp.data.weather[0].description,
                min: resp.data.main.temp_min,
                max: resp.data.main.temp_max,
                temp: resp.data.main.temp,
            };

        } catch(error){
            console.log(error); //retornar los lugares que coincidan con lugar
        }
    }

    agregarHistorial( lugar = ''){
        //TODO: Prevenir duplicado

        if(!this.historial.includes(lugar.toLocaleLowerCase())){
            this.historial = this.historial.splice(0,5);
            this.historial.unshift( lugar.toLocaleLowerCase() );
            this.guardarDB();
        } else{
            return;
        }
    }

    guardarDB(){

        const payload = {
            historial: this.historial
        };

        fs.writeFileSync(this.dbPath, JSON.stringify(payload));
    }

    leerDB(){

        //Si existe
        if(fs.existsSync(this.dbPath)){
            const info = fs.readFileSync(this.dbPath, {encoding: 'utf-8'}); 
            this.historial =  JSON.parse(info).historial;
        } else{
            return;
        }
    }
}

module.exports = Busquedas;