require('dotenv').config();
const { leerInput, inquirerMenu, pausa, listarLugares } = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");


const main = async() => {

    const busquedas = new Busquedas();
    let opcion = '';
    do {
        
        opcion = await inquirerMenu();
        switch (opcion) {
            case '1':
                //Mostrar mensjae
                const termino = await leerInput('Ciudad: ');
                //Buscar los lugares
                const lugares = await busquedas.ciudad(termino);
                //Seleccionar el lugar
                const id = await listarLugares(lugares);
                if(id === '0') continue;
                const lugarSel = lugares.find((lugar) => lugar.id === id);
                //Guardar en DB
                busquedas.agregarHistorial(lugarSel.nombre);
                //Datos del clima
                const clima = await busquedas.climaLugar(lugarSel.lat, lugarSel.lng);
                //Mostrar resultados
                console.clear();
                console.log('\nInformacion de la ciudad\n');
                console.log('Ciudad:', lugarSel.nombre);
                console.log('Lat:', lugarSel.lat);
                console.log('Lng:', lugarSel.lng);
                console.log('Temperatura:', clima.temp);
                console.log('Minima:', clima.min);
                console.log('Maxima:', clima.max);
                console.log('Cómo esta el clima:', clima.desc.green);
                break;
            case '2':
                (busquedas.historialCapitalizado).forEach((lugar, i)=>{
                    const idx = `${i + 1}`.green;
                    console.log(`${idx} ${lugar}`);
                });
                break;
        }
        if( opcion !== '0') await pausa();
    } while (opcion !== '0');

}

main();