// g2radec (gaia galaxy ra dec)
// Расчёт параметров звёзд из каталога Gaia Source
//
// Столбцы с их порядковым номером и типом данных:
// 		source_id - 2 - уникальный номер источника (целое, long)
// 		ra - 5 - прямое восхождение (угол в градусах, double)
// 		dec - 7 - склонение (угол в градусах, double)
// 		parallax - 9  паралласк (угол в градусах, расстояние)
// 		radial_velocity - 66 - угловая скорость (км/с, double)
// 		teff_val - 78 - температура звезды (К, float)
// 		radius_val - 88 - звёздный радиус (солнечный радиус, float)
// 		lum_val - 91 - звёздная светимость (светимость, float)

// Константы и параметры
const fs = require('fs');
const zlib = require('zlib');
const readline = require('readline');
const dst_path = 'D:/\Net/\Test';//Папка с файлами Gaia Source
let pipe_running = 0;//Количество запущенных потоков
let stars_count = 0;//Количество звёзд по всем файлам
//
let radius_val_max = 0;
let teff_val_max = 0;
let star_mas = [];

process.stdout.write('Inprogress');
// Таймер для ожидания завершения потоков и вывода результата
let pipes_result = setInterval(function() 
	{
	if (pipe_running == 0) 
		{
		// Вывод результата
		console.log();
		console.log('Stars Count -> ' + parseInt(stars_count,10));
		console.log('Max radius -> ' + star_mas[0][0] + '  velocity: ' + star_mas[0][1] + 'km/s' +  '  temperature: ' + star_mas[0][2] + 'К'  +'  radius: ' + star_mas[0][3] + 'RSun');
		console.log('Max temperature -> ' + star_mas[1][0] + '  velocity: ' + star_mas[1][1] + 'km/s' +  '  temperature: ' + star_mas[1][2] + 'К'  +'  radius: ' + star_mas[1][3] + 'RSun');
		process.exit();
		}
		else { process.stdout.write('.'); }
	}, 200);

// Выбор папки и получение списка файлов
process.chdir(dst_path);
let files = fs.readdirSync(dst_path);
// Запуск цикла по всем файлам
for(let i=0;i<files.length;i++)
	{
	// Проверка имени файла по маске
	if ( files[i].indexOf('GaiaSource')>=0 ) 
		{
		// Параметры потока
		let line_number = 0;
		pipe_running++;
		// Чтение отдельного файла
		read_pipe = readline.createInterface({input: fs.createReadStream(files[i]).pipe(zlib.createGunzip()),});
		// 
		read_pipe.on('line', line =>
			{
			line_number++;
			if (line_number > 1) 
				{
				// Чтение параметров звезды
				source_id = BigInt(line.split(',')[2]);
				ra = parseFloat(line.split(',')[5],10);if ( Number.isNaN(ra) ) { ra = 0; };
				dec = parseFloat(line.split(',')[7],10);if ( Number.isNaN(dec) ) { dec = 0; };
				parallax = parseFloat(line.split(',')[9],10);if ( Number.isNaN(parallax) ) { parallax = 0; };
				radial_velocity = parseFloat(line.split(',')[66],10);if ( Number.isNaN(radial_velocity) ) { radial_velocity = 0; };
				teff_val = parseFloat(line.split(',')[78],10);if ( Number.isNaN(teff_val) ) { teff_val = 0; };
				radius_val = parseFloat(line.split(',')[88],10);if ( Number.isNaN(radius_val) ) { radius_val = 0; };
				lum_val = parseFloat(line.split(',')[91],10); if ( Number.isNaN(lum_val) ) { lum_val = 0; };
				// Общее количество звёзд
				stars_count++;
			
				// Определение звезды с максимальным радиусом
				if (radius_val_max < radius_val)
					{
					radius_val_max = radius_val;
					star_mas[0] = [source_id, radial_velocity, teff_val, radius_val];
					}
				// Определение звезды с максимальной температурой
				if (teff_val_max < teff_val)
					{
					teff_val_max = teff_val;
					star_mas[1] = [source_id, radial_velocity, teff_val, radius_val];
					}
				}
			}).on('close', () =>
				{
				//Обнуление строки и уменьшение запущенных потоков
				line_number = 0;
				pipe_running--;
				});
		};//if GaiaSource
	};//for
