/*
Constantes
*/

var _formatoPoligono='http://www.opengis.net/def/crs/OGC/1.3/CRS84';
var _cadenaPoligono='POLYGON';
var _cadenaMultipoligono='MULTIPOLYGON';
var _cadenaPunto='POINT'; 
var _poligono=1;
var _multipoligono=2;
var _graficoTarta='tarta';
var _graficoColumna='columna';
var _graficoLinea='linea';
var _graficoBarra='barra';





/*
 * Esta funcion procesa una url y llama a una funcion pasandole los datos obtenidos
 * urlDatos: url a procesar
 * funcion: nombre de la funcion a la que se le pasaran los datos
 */
function obtenerDatos(urlDatos,funcion)
{	
 	$.ajax({
 	    dataType: 'jsonp',           
 	    url: urlDatos,
 		success: function(data){ 	 			
 			if (data.result.error==null)
 				procesaDatosEnFunciones(funcion,data);
			else
				alert(urlDatos+" Error: "+data.result.error);
 			
			
 	   }
 	 });
}

/*
 * Esta funcion procesa una url y llama a una funcion pasandole los datos obtenidos
 * Si detecta que hay más datos hace más llamadas hasta que no hay más páginas
 * urlDatos: url a procesar
 * pagina: el número de la página que está procesando, la primera vez que se llama se le pasa el valor cero (0)
 * funcion: nombre de la funcion a la que se le pasaran los datos
 */
function obtenerDatosFull(urlDatos,pagina,funcion)
{	
	
 	$.ajax({
 	    dataType: 'jsonp',           
 	    url: urlDatos+"&_page="+pagina,
 		success: function(data){
 			if (data.result.error!=null)
 				{
				alert(urlDatos+" Error: "+data.result.error);
				return;
 				}
 			//Si hay siguiente pagina proceso los datos y la llamo
			if (data.result.next!=null){				
	
				siguienteUrl=data.result.next;	 				
				procesaDatosEnFunciones(funcion,data);				
				obtenerDatosFull(urlDatos,pagina+1,funcion);
			}			
			//Si no hay siguiente página solo proceso los datos
			else{	
				procesaDatosEnFunciones(funcion,data);				
			}	 			
 	   }
 	 });
}

/*
 * Esta funcion procesa una url y llama a una funcion pasandole los datos obtenidos
 * Si detecta que hay más datos hace más llamadas hasta que no hay más páginas
 * urlDatos: url a procesar
 * pagina: el número de la página que está procesando, la primera vez que se llama se le pasa el valor cero (0)
 * funcion: nombre de la funcion a la que se le pasaran los datos
 * funcionF: nombre de la funcion a la que se le pasaran los datos en el ultimo paso
 */
function obtenerDatosFullFinal(urlDatos,pagina,funcion,funcionF)
{		
	
 	$.ajax({
 	    dataType: 'jsonp',           
 	   url: urlDatos+"&_page="+pagina,
 		success: function(data){		
 			if (data.result.error!=null)
				{
 				alert(urlDatos+" Error: "+data.result.error);
 				return;
				}
 			//Si hay siguiente pagina proceso los datos y la llamo
 			if (data.result.next!=null){				
 				siguienteUrl=data.result.next;	 				
 				procesaDatosEnFunciones(funcion,data); 				
 				obtenerDatosFullFinal(urlDatos,pagina+1,funcion,funcionF);				
 			}
 			//Si no hay siguiente página solo proceso los datos
 			else{								
				procesaDatosEnFunciones(funcionF,data); 				
 			}	 			
 	   }
 	 });
}

 	



/*
Funcion auxiliar que ayuda a obtener datos
descompone la cadena de funciones en distintas llamadas pasando los datos
*/
function procesaDatosEnFunciones(cadenaFunciones, data)
{	
	funciones=cadenaFunciones.split(", ");			
	for (var i=0;i<funciones.length;i++)
		{
			funcionTemp=$.trim(funciones[i]);
			if (funcionTemp.indexOf('(')<0)
				eval( funcionTemp + "($(data.result.items))" );			
			else{						
				eval( funcionTemp.replace('array','$(data.result.items)') );
				}
		}
}




function initialize()
{
	var mapOptions = {
			  center: new google.maps.LatLng(40.41661529469677,-3.7038101255893707),		                                  
			  zoom: 12,
			  mapTypeId: google.maps.MapTypeId.ROADMAP
			};

				
	mapa = new google.maps.Map(document.getElementById("mapa"), mapOptions);		
	google.maps.event.trigger(mapa, 'resize');		
	mapa.setZoom( mapa.getZoom() );	

}



/*
Muestra todas las propiedades de un objeto
*/
function inspeccionar(obj)
{
  var msg = '';

  for (var property in obj)
  {
    if (typeof obj[property] == 'function')
    {
      var inicio = obj[property].toString().indexOf('function');
      var fin = obj[property].toString().indexOf(')')+1;
      var propertyValue=obj[property].toString().substring(inicio,fin);
      msg +=(typeof obj[property])+' '+property+' : '+propertyValue+' ;\n';
    }
    else if (typeof obj[property] == 'unknown')
    {
      msg += 'unknown '+property+' : unknown ;\n';
    }
    else
    {
      msg +=(typeof obj[property])+' '+property+' : '+obj[property]+' ;\n';
    }
  }
  alert(msg);
}





/*
Funcion que busca en un array de datos la geometria y si encuentra un poligono de google lo devuelve
en caso contrario devuelve null
*/
function buscaPoligonoEnJson(array){	

	var poligonoGoogle=null;	
	if ((array!=null)&&(array.length>0))	
		{		
		//array.each(function(i, item){
		for (var i=0;i<array.length;i++)
			{
				elemento=array[i];
				if ((elemento.tieneGeometria!=null))
				{	
					geometrias=elemento.tieneGeometria;						
					//Puede venir en formato array de 1 solo elemento
					if (geometrias.length!=null)
					{
						if (geometrias.length>0)
						{
							for (var j=0;j<geometrias.length;j++)
								{
									var poligonoTemp=new String(geometrias[j].geometria);								
									//Compruebo si el formato es el de google Y
									//Si es un poligono O un multipoligono
									if  ( (poligonoTemp.indexOf(_formatoPoligono)>=0) &&
										( (poligonoTemp.indexOf(_cadenaPoligono)>=0)||(poligonoTemp.indexOf(_cadenaMultipoligono)>=0) ) 
										)
										{										
											poligonoGoogle=poligonoTemp;
											break;
										}							
								}
						}
					}
					//o en formato no array
					else if (geometrias.poligonos!=null)
					{
						var poligonoTemp=new String(geometrias.geometria);								
						//Compruebo si el formato es el de google Y
						//Si es un poligono O un multipoligono
						if  ( (poligonoTemp.indexOf(_formatoPoligono)>=0) &&
							( (poligonoTemp.indexOf(_cadenaPoligono)>=0)||(poligonoTemp.indexOf(_cadenaMultipoligono)>=0) ) 
							)
							{										
								poligonoGoogle=poligonoTemp;								
							}							
					}
				}
			}//fin bucle
		}
	return poligonoGoogle;
}

/*
Funcion que busca en un array de datos todos los poligonos de cada item y lo devuelve en un array
*/
function buscaPoligonosEnJson(array){
	var arrayPoligonos=new Array();
	if ((array!=null)&&(array.length>0))	
		{
		array.each(function(i, item){
				if ((item.tieneGeometria!=null))
				{	
					//inspeccionar(item.tieneGeometria)
					geometrias=item.tieneGeometria;					
					if (geometrias.length>0){
						for (var j=0;j<geometrias.length;j++)
							{
								var poligonoTemp=new String(geometrias[j].geometria);
								//Compruebo si el formato es el de google Y
								//Si es un poligono O un multipoligono
								
								if  ( (poligonoTemp.indexOf(_formatoPoligono)>=0) &&
									( (poligonoTemp.indexOf(_cadenaPoligono)>=0)||(poligonoTemp.indexOf(_cadenaMultipoligono)>=0) ) 
									)
									{
										arrayPoligonos.push(poligonoTemp);
									}							
							}
						}
				}
			});
		}
	return arrayPoligonos;
}



/*
Funcion que recibe una cadena que contiene las coordenadas de un poligono
y devuelve un array de coordenadas de google
*/
function trataPoligono(cadena)
{	
	var coordenadas=new Array();	
	//Quitamos a la cadena el principio y el final	
	cadena=cadena.replace(_cadenaPoligono+" ((","");	
	//Esta linea pasan a ser 2
	//cadena=cadena.replace("<"+_formatoPoligono+"> ","");		
	cadena=cadena.replace(_formatoPoligono,"");
	cadena=cadena.replace("<> ","");    
	cadena=cadena.replace("))","");	
	
	//Sustituimos las , por " " para generar un solo array con [long,lat,long,lat,long,...]	
	while (cadena.indexOf(",")>0)
		cadena=cadena.replace(","," ");			
	//generamos un array temporal con las coordenadas
	
	arrayTemporal=cadena.split(" ");			
	
	//generamos por cada dos posiciones una latitud longitud (40,-3) de google
	//lo añadimos al array lo devolvemos
	
	for (var k=0;k<arrayTemporal.length;k=k+2)
		{			
			coordenadas.push(new google.maps.LatLng(arrayTemporal[k+1],arrayTemporal[k]));			
		}	
	return (coordenadas);
}


/*
Funcion que recibe una cadena que contiene las coordenadas de un multipoligono
y devuelve un array de arrays de coordenadas de google
*/
function trataMultiPoligono(cadena)
{
	var coordenadas=new Array();		
	//Quitamos a la cadena el principio y el final	
	cadena=cadena.replace(_cadenaMultipoligono+" ","");	
	cadena=cadena.replace("<"+_formatoPoligono+"> ","");
	cadena=cadena.replace("(((","(");
	cadena=cadena.replace(")))",")");
	
	//Ahora tenemos que generar un array que contenga los distintos poligonos
	arrayPoligonos=cadena.split("),(");
	
	//Por cada poligono generamos coordenadas de google
	for (var i=0;i<arrayPoligonos.length;i++)
	{
		cadenaTemp=arrayPoligonos[i];
		cadenaTemp=cadenaTemp.replace("(","");
		cadenaTemp=cadenaTemp.replace(")","");
		//Sustituimos las , por " " para generar un solo array con [long,lat,long,lat,long,...]	
		while (cadenaTemp.indexOf(",")>0)
			cadenaTemp=cadenaTemp.replace(","," ");				
		//generamos un array temporal con las coordenadas
		arrayTemporal=cadenaTemp.split(" ");			
		//generamos por cada dos posiciones una latitud longitud (40,-3) de google
		//lo añadimos al array lo devolvemos	
		var coordenadasTemp=new Array();
		for (var k=0;k<arrayTemporal.length;k=k+2)
			{			
				coordenadasTemp.push(new google.maps.LatLng(arrayTemporal[k+1],arrayTemporal[k]));			
			}	
		coordenadas.push(coordenadasTemp);
	}
	return coordenadas;
}

/*
Funcion que recibe una cadena que contiene coordenadas de un poligono o multipoligono
si es poligono devuelve 1, si es multipoligono 2, si no encuentra nada devuelve -1
*/
function tipoPoligono(cadena)
{
	
	if ((cadena!=null)&&(cadena!=''))
	{
		
		if (cadena.indexOf(_cadenaMultipoligono)>=0)
			return _multipoligono;
		else if (cadena.indexOf(_cadenaPoligono)>=0)
			return _poligono;
		else 
			return -1;
	}
	else
		return -1;
}

/*
Funcion que pinta un polígono en un mapa de google
Recibe un array de coordenadas, el mapa de google (objecto), el color del polígono y su opacidad
Añadimos el color del Borde y la opacidad como opcionales
Devolvemos el poligono, por si queremos añadirle un infowindow
*/
function pintaPoligonoEnMapaGoogle(vectorC, mapa, color, opacidad, colorBorde, opacidadBorde)
{	
	
	colorBorde=(colorBorde || "#333333");
	opacidadBorde=(opacidadBorde || 0.8);
	
		poligonoTemporal = new google.maps.Polygon({
			paths: vectorC,
			strokeColor: colorBorde,
			strokeOpacity: opacidadBorde,
			strokeWeight: 1,
			fillColor: color,
			fillOpacity: opacidad
		  });		
		
		
		poligonoTemporal.setMap(mapa);
		
		
		
		return poligonoTemporal;
}



/*
Funcion que pinta un polígono en un mapa de google centrado
Recibe un array de coordenadas, el mapa de google (objecto), el color del polígono y su opacidad
Devolvemos el poligono, por si queremos añadirle un infowindow
*/
function pintaPoligonoEnMapaGoogleCentrado(vectorC, mapa, color, opacidad)
{	
	pintaPoligonoEnMapaGoogle(vectorC, mapa, color, opacidad);

	
	centraPoligonoEnMapa(vectorC,mapa);
	
	
	return poligonoTemporal;
}

function centraPoligonoEnMapa(vectorC,mapa)
{
	//Con esto centramos el polígono en el mapa	
	var latlngbounds = new google.maps.LatLngBounds();
	for (var i = 0; i < vectorC.length; i++) {
		latlngbounds.extend(vectorC[i]);
	}
	mapa.fitBounds(latlngbounds);
}

function centrarPoligonosEnMapa(vPoligonos,mapa)
{
	//Punto más alto
	var latMax=0;
	//Punto más bajo
	var latMin=0;
	//Punto más a la derecha
	var longMax=0;
	//Punto más a la izquierda
	var longMin=0;
	
	//alert(vPoligonos.length)
	for ( var i = 0; i < vPoligonos.length; i++) {

		vectorTemp = vPoligonos[i].getPath();
		
		if (latMax==0) latMax=vectorTemp.getAt(0).lat();
		if (latMin==0) latMin=vectorTemp.getAt(0).lat();
		if (longMax==0)	longMax=vectorTemp.getAt(0).lng();
		if (longMin==0)	longMin=vectorTemp.getAt(0).lng();

		for (var j = 0; j < vectorTemp.length; j++) {
			
			if (vectorTemp.getAt(j).lat()>latMax) latMax=vectorTemp.getAt(j).lat();
			if (vectorTemp.getAt(j).lat()<latMin)	latMin=vectorTemp.getAt(j).lat();
			if (vectorTemp.getAt(j).lng()>longMax) longMax=vectorTemp.getAt(j).lng();
			if (vectorTemp.getAt(j).lng()<longMin) longMin=vectorTemp.getAt(j).lng();
			
		}
	}
	
	p1=new google.maps.LatLng(latMax,longMin);	
	p2=new google.maps.LatLng(latMin,longMax);
	
	//new google.maps.Marker({position: p1, map: mapa, animation: google.maps.Animation.DROP, title:"P1"});
	//new google.maps.Marker({position: p2, map: mapa, animation: google.maps.Animation.DROP, title:"P2"});
	
	//Con esto centramos el polígono en el mapa	
	var latlngbounds = new google.maps.LatLngBounds();
	latlngbounds.extend(p1);
	latlngbounds.extend(p2);	
	mapa.fitBounds(latlngbounds);
}

/*
Funcion que pinta una Tabla de Google (google.visualization.Table)
Recibe el id de la capa que contiene la tabla, los datos y las opciones
*/
function tablaGoogle(idGrafico, datos, opciones)
{	
	var table = new google.visualization.Table(document.getElementById(idGrafico));	
	table.draw(datos, opciones);
	return table;
}


function tablaGoogleFormatos(idGrafico, datos, opciones, formatos)
{		
	
	for (var i=0;i<formatos.length;i++)
	{
		if (formatos[i]!=null)
		{
			formatter=formatos[i];
			formatter.format(datos, i);
		}
	}
	
	return tablaGoogle(idGrafico,datos, opciones);	
}

/*
Funcion que pinta una Tabla de Google (google.visualization.Table)
Recibe el id de la capa que contiene la tabla, los datos, las opciones y vectorAligns
En el ultimo parametro es una array que indica las alineaciones de las columnas:
{left,right,null,left}
*/
function tablaGoogleAlign(idGrafico, datos, opciones,vectorAligns)
{
	var table = new google.visualization.Table(document.getElementById(idGrafico));	
	for (var j = 0; j < vectorAligns.length; j++) {
	
		if (vectorAligns[j]!=null)
			alinearDataColumnaTable(datos,j,vectorAligns[j]);
	}
	
	table.draw(datos, opciones);
	return table;
}
	
function alinearDataColumnaTable(datos,columna,align)
{
	numFilas=datos.getNumberOfRows();	
	for (var i=0;i<numFilas;i++)
		datos.setProperty(i,columna,'style', 'text-align:'+align);
}


function tablaGoogleArray(idTabla,opciones,array,columNamesTable,columNamesLabel, columTypes)
{		
	var datos = arrayJsonToGoogleDataTable(array,columNamesTable,columNamesLabel, columTypes);	
	return tablaGoogle(idTabla,datos, opciones);	
}


function tablaGoogleArrayFormatos(idTabla,opciones,array,columNamesTable,columNamesLabel, columTypes, formatos)
{		
	var datos = arrayJsonToGoogleDataTable(array,columNamesTable,columNamesLabel, columTypes);

	for (var i=0;i<formatos.length;i++)
	{
		if (formatos[i]!=null)
		{
			formatter=formatos[i];
			formatter.format(datos, i);
		}
	}
	
	return tablaGoogle(idTabla,datos, opciones);	
}

/*
Funcion que recibe un array de Json con items y devuelve un DataTable de google
Recibe array: array de items en json
	   columnNamesTable: el nombre las columnas en la consulta
	   columnNamesLabel: la etiqueta que se muestra en pantalla
	   columnTypes: tipo de las columnas
*/
function arrayJsonToGoogleDataTable(array,columNamesTable,columNamesLabel, columTypes)
{
	var datos = new google.visualization.DataTable();
	if ((columNamesLabel.length==columTypes.length)&&(columTypes.length==columNamesTable.length))
		{
			//Añado columnas y tipo
			for (var i=0;i<columNamesLabel.length;i++)
			{
				datos.addColumn(columTypes[i], columNamesLabel[i]);
			}
		}
	else
		return null;
	
	datosTemp=new Array();
	
	if (array.length>0)
		array.each(function(i, item){	
		
			/*Compongo una cadena con este formato para evaluarla despues	
			cadenaPush="datosTemp.push(new Array(item.label,item.densidadComercial))";
			*/
			cadenaPush="";
			for (var j=0;j<columNamesTable.length;j++)
			{
				//detecto si es un array				
				cadenaTemp="isArray(item."+columNamesTable[j]+")";
				if (eval(cadenaTemp)==true)					
					cadenaPush+='item.'+columNamesTable[j]+'[0],';
				else
					cadenaPush+='item.'+columNamesTable[j]+',';			
			}
			//borro la última coma
			cadenaPush=cadenaPush.slice(0,-1);
			//compongo el resto
			cadenaPush='datosTemp.push(new Array('+cadenaPush+'))';
		
							
			eval(cadenaPush);			
		});	
	
	datos.addRows(datosTemp);
	
	
	
	return datos;
}

/*
Funcion que pinta un grafico de tarta
Recibe idGrafico: id de la capa que contiene el grafico
	   datos: datos en formato google.visualization.DataTable
	   opciones: opciones del gráfico	   
*/
function graficoTarta(idGrafico, datos, opciones)
	{	
		var chart = new google.visualization.PieChart(document.getElementById(idGrafico));		
        chart.draw(datos, opciones);		
	}
	
/*
Funcion que pinta un grafico de tarta
Recibe idGrafico: id de la capa que contiene el grafico
	   datos: datos en formato google.visualization.DataTable
	   opciones: opciones del gráfico
	   columna: la columna de la tabla de datos que queremos pintar
*/
function graficoTartaColumna(idGrafico, datos, opciones, columna)
	{	
		var chart = new google.visualization.PieChart(document.getElementById(idGrafico));	
		numColumnas=datos.getNumberOfColumns();
		
		if ((columna>=1)&&(columna<=numColumnas))
		{	
			//creo una nueva tabla
			var datosTemp = new google.visualization.DataTable();
			//inserto la columna 0 que son las etiquetas
			datosTemp.insertColumn(0, datos.getColumnType(0),datos.getColumnLabel(0),datos.getColumnId(0));			
			//inserto la columna que me ha solicitado			
			datosTemp.insertColumn(1, datos.getColumnType(columna),datos.getColumnLabel(columna),datos.getColumnId(columna));
			//Ahora inserto los datos
			for (var i=0;i<datos.getNumberOfRows();i++){			
				datosTemp.addRow([datos.getValue(i, 0),datos.getValue(i, columna) ]);
			}
			chart.draw(datosTemp, opciones);					
		}
		else{
			alert("la columna especificada no es válida");
		}
	}

/*
Funcion que pinta un grafico de tarta
Recibe idGrafico: id de la capa que contiene el grafico
	   datos: datos en formato google.visualization.DataTable
	   opciones: opciones del gráfico
	   columna: la columna de la tabla de datos que queremos pintar
	   formato: recibe el formato de la columna que va a representar
*/
function graficoTartaColumnaFormato(idGrafico, datos, opciones, columna, formato)
	{	
		var chart = new google.visualization.PieChart(document.getElementById(idGrafico));	
		numColumnas=datos.getNumberOfColumns();
		
		if ((columna>=1)&&(columna<=numColumnas))
		{	
			//creo una nueva tabla
			var datosTemp = new google.visualization.DataTable();
			//inserto la columna 0 que son las etiquetas
			datosTemp.insertColumn(0, datos.getColumnType(0),datos.getColumnLabel(0),datos.getColumnId(0));			
			//inserto la columna que me ha solicitado			
			datosTemp.insertColumn(1, datos.getColumnType(columna),datos.getColumnLabel(columna),datos.getColumnId(columna));
			//Ahora inserto los datos
			for (var i=0;i<datos.getNumberOfRows();i++){			
				datosTemp.addRow([datos.getValue(i, 0),datos.getValue(i, columna) ]);
			}
			
			formato.format(datosTemp,1);			
			chart.draw(datosTemp, opciones);					
		}
		else{
			alert("la columna especificada no es válida");
		}
	}
	
	
	
/*
Funcion que pinta un grafico de tarta
Recibe idGrafico: id de la capa que contiene el grafico
	   opciones: las opciones del grafico
	   array: array de items en json
	   columnNamesTable: el nombre las columnas en la consulta
	   columnNamesLabel: la etiqueta que se muestra en pantalla
	   columnTypes: tipo de las columnas
*/	
function graficoTartaArray(idGrafico,opciones,array,columNamesTable,columNamesLabel,columTypes)
{
	var datos = arrayJsonToGoogleDataTable(array,columNamesTable,columNamesLabel, columTypes);			
	graficoTarta(idGrafico,datos, opciones);
}
	
	
function graficoColumna(idGrafico, datos, opciones) {    
		
        var chart = new google.visualization.ColumnChart(document.getElementById(idGrafico));		
        chart.draw(datos, opciones);
}	


/*
Funcion que pinta un grafico de columna
Recibe idGrafico: id de la capa que contiene el grafico
	   opciones: las opciones del grafico
	   array: array de items en json
	   columnNamesTable: el nombre las columnas en la consulta
	   columnNamesLabel: la etiqueta que se muestra en pantalla
	   columnTypes: tipo de las columnas
*/	
function graficoColumnaArray(idGrafico,opciones,array,columNamesTable,columNamesLabel,columTypes)
{
	var datos = arrayJsonToGoogleDataTable(array,columNamesTable,columNamesLabel, columTypes);			
	graficoColumna(idGrafico,datos, opciones);
}


function graficoColumnaColumnas(idGrafico,datos,opciones,arrayVisibles)
{
	var chart = new google.visualization.ColumnChart(document.getElementById(idGrafico));        
	
	var datosTemp = modificaDatosVisiblidad(datos,arrayVisibles);
		
	chart.draw(datosTemp, opciones);			
}



/*
Funcion que recibe unos datos en formato google data table
También recibe un array de las columnas que deben de ser visibles
La primera columnas no se toca porque son las etiquetas
Copia los datos dejando solo las columnas deseadas
*/
function modificaDatosVisiblidad(datos, arrayVisibles)
{
	//creo una nueva tabla
	var datosTemp = new google.visualization.DataTable();
	//inserto la columna 0 que son las etiquetas
	datosTemp.insertColumn(0, datos.getColumnType(0),datos.getColumnLabel(0),datos.getColumnId(0));			
	
	//inserto las columnas que me han solicitado
	contadorColumnas=1;
	for (var i=0;i<arrayVisibles.length;i++)
		{
			if (arrayVisibles[i]==true)
			{
				datosTemp.insertColumn(contadorColumnas, datos.getColumnType(i+1),datos.getColumnLabel(i+1),datos.getColumnId(i+1));
				contadorColumnas++;
			}
		}	
	//Creo una cadena para eval que tenga el siguiente formato:
	//datosTemp.addRow([datos.getValue(i,0),datos.getValue(i,2),datos.getValue(i,3)]);	
	cadenaEval="[datos.getValue(i,0)";
	for (var i=0;i<arrayVisibles.length;i++)
		{
			if (arrayVisibles[i]==true)
				{
					cadenaEval+=",datos.getValue(i,"+(i+1)+")";
				}
		}		
	cadenaEval="datosTemp.addRow("+cadenaEval+"])";
	//Ejecuto la cadena tantas veces como filas haya
	for (var i=0;i<datos.getNumberOfRows();i++)
		{
			eval(cadenaEval);			
		}
	return datosTemp;
}


function graficoLinea(idGrafico, datos, opciones) {    

        var chart = new google.visualization.LineChart(document.getElementById(idGrafico));
        chart.draw(datos, opciones);
}	

/*
Funcion que pinta un grafico de Linea
Recibe idGrafico: id de la capa que contiene el grafico
	   opciones: las opciones del grafico
	   array: array de items en json
	   columnNamesTable: el nombre las columnas en la consulta
	   columnNamesLabel: la etiqueta que se muestra en pantalla
	   columnTypes: tipo de las columnas
*/	
function graficoLineaArray(idGrafico,opciones,array,columNamesTable,columNamesLabel,columTypes)
{
	var datos = arrayJsonToGoogleDataTable(array,columNamesTable,columNamesLabel, columTypes);		
	graficoLinea(idGrafico,datos, opciones);
}

function graficoLineaColumnas(idGrafico,datos,opciones,arrayVisibles)
{
	var chart = new google.visualization.LineChart(document.getElementById(idGrafico));        
	
	var datosTemp = modificaDatosVisiblidad(datos,arrayVisibles);
		
	chart.draw(datosTemp, opciones);			
}
	
/*
Funcion que pinta un grafico de tarta
Recibe idGrafico: id de la capa que contiene el grafico
	   datos: datos en formato google.visualization.DataTable
	   opciones: opciones del gráfico	   
*/
function graficoBarra(idGrafico, datos, opciones) {    

        var chart = new google.visualization.BarChart(document.getElementById(idGrafico));
        chart.draw(datos, opciones);
}

/*
Funcion que pinta un grafico de Linea
Recibe idGrafico: id de la capa que contiene el grafico
	   opciones: las opciones del grafico
	   array: array de items en json
	   columnNamesTable: el nombre las columnas en la consulta
	   columnNamesLabel: la etiqueta que se muestra en pantalla
	   columnTypes: tipo de las columnas
*/	
function graficoBarraArray(idGrafico,opciones,array,columNamesTable,columNamesLabel,columTypes)
{
	var datos = arrayJsonToGoogleDataTable(array,columNamesTable,columNamesLabel, columTypes);		
	graficoBarra(idGrafico,datos, opciones);
}
	
function graficoBarraColumnas(idGrafico,datos,opciones,arrayVisibles)
{
	var chart = new google.visualization.BarChart(document.getElementById(idGrafico));        
	
	var datosTemp = modificaDatosVisiblidad(datos,arrayVisibles);
		
	chart.draw(datosTemp, opciones);			
}

function verticalTableToDataTable(idTable,columNames,columTypes)
{
	    var datos = new google.visualization.DataTable();
		var arrayDatos = new Array();
		var columnasTablaHTML=($("#"+idTable).find('tr')[0].cells.length);
		if (columnasTablaHTML!=columTypes.length)
		{
			alert("verticalTableToDataTable: el número de las columnas html no coinciden con las recibidas");
			return null;
		}
		if (columNames.length!=columTypes.length)
		{
			alert("verticalTableToDataTable: el número de columnas recibidas no coinciden");
			return null;
		}
		
		
		if (columNames.length==columTypes.length)
		{
			//Añado columnas y tipo
			for (var i=0;i<columNames.length;i++)
			{
				datos.addColumn(columTypes[i], columNames[i]);				
			}	
			//Compruebo si existe THEAD, porque si existe el indice tiene que ser 0 para que utilice el primer tr del tbody
			if ($("#"+idTable+" thead").length) {				
				indiceMinimo=0;
			}else{
				indiceMinimo=1;
			}
			//recorro los datos de la tabla
			$("#"+idTable+" tbody tr").each(function (index) {				
					if (index>=indiceMinimo)
					{	
						arrayDatosTemp=new Array();
						$(this).children("td").each(function (index2) {
							arrayDatosTemp.push(formatoDataTable($(this).text(),columTypes[index2]));
	                    });      										
						arrayDatos.push(arrayDatosTemp);					
					}
		    });
			
			datos.addRows(arrayDatos);
			//inspeccionar(arrayDatos)
			return datos;
		}
		else
			return null;
}





function horizontalTableToDataTable(idTable,columNames,columTypes)
{
	    var datos = new google.visualization.DataTable();
		var arrayDatos = new Array();
		
		var filasTablaHTML=$("#"+idTable+" tbody tr").length;		
		if (filasTablaHTML!=columTypes.length)
		{
			alert("verticalTableToDataTable: el número de las filas html no coinciden con las recibidas");
			return null;
		}
		if (columNames.length!=columTypes.length)
		{
			alert("verticalTableToDataTable: el número de filas recibidas no coinciden");
			return null;
		}
		
		if (columNames.length==columTypes.length)
		{
			//Añado columnas y tipo
			for (var i=0;i<columNames.length;i++)
			{
				datos.addColumn(columTypes[i], columNames[i]);
			}	
			
			columnas=($("#"+idTable).find('tr')[0].cells.length)-1;
			filas=$("#"+idTable+" tbody tr").length; 
			
			
			//alert(columnas)
			//alert(filas)		
			
			cadenaEval="";
			for (var i=0;i<filas;i++)
			{
				cadenaEval+="formatoDataTable((document.getElementById(idTable).rows["+i+"].cells[i].firstChild.nodeValue),columTypes["+i+"]),";	
			}
			cadenaEval=cadenaEval.slice(0,-1);
			cadenaEval="arrayDatos.push(new Array("+cadenaEval+"))";
			
			for (var i=1;i<columnas;i++)
			{				
				eval(cadenaEval);
			}
			datos.addRows(arrayDatos);
			
			return datos;
		}
		else
			return null;
}


 	/*
	Funcion que rellana una tabla horizontal
	Recibe 	idTabla:el id de la tabla que hay que rellenar
			array: el array en formato JSON con los items
			columnasConsultas: las columnas a utilizar en la consulta
	*/
 	function rellenaTablaHorizontal(idTabla, array, columnasConsulta)
 	{			
		var filaTemp='';
		var columnas= new Array();
		
		//Guardo el nombre de las columnas
		$('#' +idTabla+' tr th ').each(function(){
			columnas.push($(this).html());
		});
		
		$('#'+idTabla+' tr').remove();
		
		
		for (var j=0;j<columnasConsulta.length;j++)
		{
			filaTemp+='<tr><th>'+columnas[j]+'</th>';
			array.each(function(i, item){
				//detecto si es un array				
				cadenaEval="isArray(item."+columnasConsulta[j]+")";
				if (eval(cadenaEval)==true)					
					cadenaEval="filaTemp+='<td>' + item."+columnasConsulta[j]+"[0] +  '</td>'";
				else
					cadenaEval="filaTemp+='<td>' + item."+columnasConsulta[j]+" +  '</td>'";				
				eval(cadenaEval);	
			});
			filaTemp+='</tr>';
			$('#'+idTabla).append(filaTemp);	
			filaTemp='';
		}

 	}

	/*
	Funcion que rellana una tabla vertical
	Recibe 	idTabla:el id de la tabla que hay que rellenar
			array: el array en formato JSON con los items
			columnasConsultas: las columnas a utilizar en la consulta
	*/
 	function rellenaTablaVertical(idTabla, array, columnasConsulta)		
 	{			
		var filaTemp='';		
		//$('#resultadosTabla tr:not(:first)').remove();
		
		filaTemp+='<tr><td/>';		
		if (array.length<=0)
			return
			
		for (var i=0;i<array.length;i++)
		{
			elemento=array[i];			
			filaTemp='<tr>';
			for (var j=0;j<columnasConsulta.length;j++)
			{
				//detecto si es un array				
				cadenaEval="isArray(elemento."+columnasConsulta[j]+")";
				if (eval(cadenaEval)==true)
					cadenaEval="filaTemp+='<td>' + elemento."+columnasConsulta[j]+"[0] +  '</td>'";
				else
					cadenaEval="filaTemp+='<td>' + elemento."+columnasConsulta[j]+" +  '</td>'";
				eval(cadenaEval);			
			}
			filaTemp+='</tr>';
			$('#'+idTabla).append(filaTemp);				
		}
 		
 	}


function formatoDataTable(valor, tipo)
{
	if (tipo=='string')
		//return "'"+valor+"'";
		return valor;
	else 
		return Number(valor);
}

/*
	Funcion que rellena un combo con los datos contiene un array json
	recibe  array, el array json
			idCombo, el id del combo a rellenar
			texto, la propiedad (o propiedades separadas por ,) que va a coger de cada item en el array json y ponerla en el texto del combo
			valor, la propiedad que va a coger de cada item en el array json y ponerla en el value del combo
*/
function rellenaCombo(array,idCombo,texto,valor)
 	{			
		if (texto.indexOf(",")<0)
			cadenaEval="$('#"+idCombo+"').append(new Option(item."+texto+", item."+valor+", true, true))";
		else
			{
				arrayTexto=texto.split(",");
				cadenaEval='';
				for (var i=0;i<arrayTexto.length;i++)
					cadenaEval+="item."+arrayTexto[i]+"+' - '+";
				cadenaEval=cadenaEval.slice(0,-7);
				cadenaEval="$('#"+idCombo+"').append(new Option("+cadenaEval+", item."+valor+", true, true))";			
			}		
		
		array.each(function(i, item){					
			eval(cadenaEval);		
 		});		
 		$('#'+idCombo).val("-1"); 
 	}


/*
	Funcion que rellena un combo con los datos contiene un array json
	recibe  array, el array json
			idCombo, el id del combo a rellenar
			texto, la propiedad (o propiedades separadas por ,) que va a coger de cada item en el array json y ponerla en el texto del combo
			valor, la propiedad que va a coger de cada item en el array json y ponerla en el value del combo
			nCaracteres, el numero de caracteres que dejamos en cada option
*/
function rellenaRecortaCombo(array,idCombo,texto,valor,nCaracteres)
 	{			
		if (texto.indexOf(",")<0)
			cadenaEval="$('#"+idCombo+"').append(new Option(item."+texto+", item."+valor+", true, true))";
		else
			{
				arrayTexto=texto.split(",");
				cadenaEval='';
				for (var i=0;i<arrayTexto.length;i++)
					cadenaEval+="item."+arrayTexto[i]+"+' - '+";
				cadenaEval=cadenaEval.slice(0,-7);
				cadenaEval="$('#"+idCombo+"').append(new Option("+cadenaEval+", item."+valor+", true, true))";			
			}		
		
		array.each(function(i, item){					
			eval(cadenaEval);		
 		});		
 		
 		recortaTextoCombo(idCombo,nCaracteres);
 		
 		$('#'+idCombo).val("-1"); 
 	}
	

/*
Funcion que recibe un array y un objeto mapa
coloca las posiciones en el mapa y devuelve un array de marcas, que contiene el item
*/	
function pintaMarcasEnMapaGoogle(array,mapa)
{
	var arrayMarcas=new Array();
	array.each(function(i, elemento){
	if (elemento.posicion!=null)
	{	
		etiqueta="";			
			if (isArray(elemento.label))
			{		
				for (var j=0;j<elemento.label.length;j++)
				{
					if (elemento.label[0].length>etiqueta.length)
						etiqueta=elemento.label[0];
				}
			}
			else
				etiqueta=elemento.label;
		var coordenada = new google.maps.LatLng(elemento.posicion.latitud,elemento.posicion.longitud);
		var marker = new google.maps.Marker({
			position: coordenada,
			map: mapa,
			title: etiqueta,					
		});
		
		//Añadimos el item al objeto marker
		var tempObj = {
			'item':elemento,					
		};
		marker.objInfo = tempObj;
		
		arrayMarcas.push(marker);
	}
	 });
	 return arrayMarcas;
}

/*
Funcion que recibe un array, un objeto mapa, y la url de la imagen para pintar como marca
coloca las posiciones en el mapa y devuelve un array de marcas, que contiene el item
*/	
function pintaMarcasEnMapaGoogleIcono(array,mapa,urlIcono)
{
	/*
	http://maps.google.com/mapfiles/ms/icons/green-dot.png
    http://maps.google.com/mapfiles/ms/icons/blue-dot.png
    http://maps.google.com/mapfiles/ms/icons/red-dot.png
	*/
		
	
	var arrayMarcas=new Array();
	if (array.length>0)
		for (var i=0;i<array.length;i++)
		{			
			elemento=array[i];
			if (elemento.posicion!=null)
			{			
				etiqueta="";
				//if (item.label.length>1)
				if (isArray(elemento.label))
				{		
					for (var j=0;j<elemento.label.length;j++)
					{
						if (elemento.label[0].length>etiqueta.length)
							etiqueta=elemento.label[0];
					}
				}
				else
					etiqueta=elemento.label;
				var coordenada = new google.maps.LatLng(elemento.posicion.latitud,elemento.posicion.longitud);			
				var marker = new google.maps.Marker({
					position: coordenada,
					map: mapa,
					title: etiqueta,		
					icon: urlIcono
				});			
			
				marker.objItem = elemento;				
				arrayMarcas.push(marker);
			}
		}
	return arrayMarcas;
}

function pintaMarca(mapa,coordenada,urlIcono,etiqueta,animacion)
{
	if (animacion)	
		marca=new google.maps.Marker({position: coordenada, map: mapa, title:etiqueta,  icon: urlIcono, animation: google.maps.Animation.DROP,});
	else
		marca=new google.maps.Marker({position: coordenada, map: mapa, title: etiqueta, icon: urlIcono});
	return marca;
}

function generaArrayDatos(arrayDatos, arrayColumnas)
{
	var arrayGenerado=new Array();
	var cadenaEval="";
	for (var j=0;j<arrayColumnas.length;j++)	
		{
			cadenaEval+="item."+arrayColumnas[j]+",";						
		}	
		
	
	cadenaEval=cadenaEval.slice(0,-1);
	
	cadenaEval="arrayGenerado.push(new Array("+cadenaEval+"))";	
	
	arrayDatos.each(function(i, item){			
		eval(cadenaEval);
	});
	
	
	return arrayGenerado;
}

function generaArrayDatosExcluye(arrayDatos, arrayColumnas, arrayExcluyente)
{
	var arrayGenerado=generaArrayDatos(arrayDatos, arrayColumnas);
	var cadenaEval="";	
	for (var j=0;j<arrayColumnas.length;j++)	
		{
			cadenaEval+="item."+arrayColumnas[j]+",";						
		}	
		
	
	cadenaEval=cadenaEval.slice(0,-1);
	
	cadenaEval="arrayGenerado.push(new Array("+cadenaEval+"))";	
	
	arrayDatos.each(function(i, item){			
		eval(cadenaEval);
	});
	
	
	return arrayGenerado;
}

function filtraArrayLabel(array,valor)
{	
	var arrayAux=new Array();	
	valor=valor.toUpperCase();
	if (array.length>0)
	{
		array.each(function(i, item){
			etiqueta=item.label;
			
			if (isArray(etiqueta))
				etiqueta=etiqueta[0];
			etiqueta=etiqueta.toUpperCase();		
			
			if ( etiqueta.indexOf(valor)>=0 ) 
				{
					arrayAux.push(item);
				}		
		});
	}
	return arrayAux;
}

/*
Funcion que pinta un rectangulo en un mapa de google
Recibe coordenada noreste, coordenada suroeste, el mapa de google (objecto), el color y su opacidad
Devolvemos el poligono, por si queremos añadirle un infowindow
*/
function pintaRectanguloEnMapaGoogle(coordNE,coordSW,mapa,color,opacidad)
{
	var box = new google.maps.Rectangle({
			map:mapa,
			strokeOpacity:opacidad,
			strokeColor: color,
			bounds:new google.maps.LatLngBounds(coordSW,coordNE)
			});
	return box;
}

/*
Funcion que pinta un rectangulo en un mapa de google centrado
Recibe coordenada noreste, coordenada suroeste, el mapa de google (objecto), el color y su opacidad
Devolvemos el poligono, por si queremos añadirle un infowindow
*/
function pintaRectanguloEnMapaGoogleCentrado(coordNE,coordSW,mapa,color,opacidad)
{	
	rectangulo=pintaRectanguloEnMapaGoogle(coordNE,coordSW, mapa, color, opacidad);
	
	var latlngbounds = new google.maps.LatLngBounds();	
	latlngbounds.extend(coordNE);
	latlngbounds.extend(coordSW);
	
	mapa.fitBounds(latlngbounds);

	return rectangulo;
}

/*
Funcion que calcula las dos esquinas de un cuadrado a patir de una coordanada y su radio
Devuelve un array con las coordenadas ne y sw
*/
function calculaCuadradoAlrededorPunto(coordenada,radio)
{
	var esquinas=new Array();
	ne = google.maps.geometry.spherical.computeOffset(coordenada, radio, 0); 
	ne = google.maps.geometry.spherical.computeOffset(ne, radio, 90);
	se = google.maps.geometry.spherical.computeOffset(ne, radio*2, 180);
	sw = google.maps.geometry.spherical.computeOffset(se, radio*2, 270);
	//nw = google.maps.geometry.spherical.computeOffset(sw, radio*2, 0)
	esquinas.push(ne);
	esquinas.push(sw);
	return esquinas;
}


function calculaCentroPoligono(vectorC)
{
	var latlngbounds = new google.maps.LatLngBounds();
	for (var i=0;i<vectorC.length;i++)
		{
		latlngbounds.extend(vectorC[i]);
		}	
	return latlngbounds.getCenter();	
}





function getCelda(idTabla,fila,columna)
{	
	if (document.getElementById(idTabla).rows[fila]==undefined)	return undefined;
	
	if (document.getElementById(idTabla).rows[fila].cells[columna]==undefined)	return undefined;
	
	return document.getElementById(idTabla).rows[fila].cells[columna].firstChild.nodeValue;
}



function setCelda(idTabla,fila,columna,valor)
{
	document.getElementById(idTabla).rows[fila].cells[columna].firstChild.nodeValue=valor;
}

function redondea2dec(valor)
{
	return Math.round(parseFloat(valor)*100)/100;
}


function recortaTextoCombo(idCombo,numeroCaracteres)
{
	
    $("#"+idCombo+" option").each(function(){    	
    	var cadenaRecortada=new String ($(this).text());
    	cadenaRecortada=cadenaRecortada.substring(0,numeroCaracteres);
        $(this).text(cadenaRecortada);        
     });
    
}

function vaciaTablaVertical(idTabla)
{
	$('#'+idTabla+' tr:not(:first)').remove();
}

/* Funcion que hace una regla de tres para obtener el valor que le corresponde respecto a un máximo
 * Tiene un factor corrector para que cuando sea el máximo no sea 1 */
function calculaIntensidadCloropeta(valor,maximo)
{
	//esta variable se usa para que la opacidad no sea total y se pueda leer lo que hay abajo
	factorCorrector=0.9;	
	return (Math.round((valor * factorCorrector * 100) / maximo)) / 100;	
}

//formateo con . en miles y , en comas
function formateaNumerosTabla(idTabla)
{
	numfilas=$("#"+idTabla+" tbody tr").length;
	numcolumnas=($("#"+idTabla).find('tr')[0].cells.length);
	for (var i=1;i<numcolumnas;i++){		
		for (var j=1;j<numfilas;j++){
			if ($.isNumeric(getCelda(idTabla,j,i)))
				setCelda(idTabla,j,i,formato_numero(getCelda(idTabla,j,i)));			
		}
	}	
}

function ordenarComboPorTexto(id) {
    // Loop for each select element on the page.
    $(id).each(function() {            
        // Keep track of the selected option.
        var selectedValue = $(this).val();     
        // Sort all the options by text. I could easily sort these by val.
        $(this).html($("option", $(this)).sort(function(a, b) {
            return a.text == b.text ? 0 : a.text < b.text ? -1 : 1;
        }));     
        // Select one option.
        $(this).val(selectedValue);
    });
}

function trataCaracteresParametro(cadena)
{
	while (cadena.indexOf("#")>=0) cadena=cadena.replace("#","%23");
	
	while (cadena.indexOf("á")>=0) cadena=cadena.replace("á","%C3%A1");
	while (cadena.indexOf("é")>=0) cadena=cadena.replace("é","%C3%A9");
	while (cadena.indexOf("í")>=0) cadena=cadena.replace("í","%C3%AD");
	while (cadena.indexOf("ó")>=0) cadena=cadena.replace("ó","%C3%B3");
	while (cadena.indexOf("ú")>=0) cadena=cadena.replace("ú","%C3%BA");
	                                                  
	while (cadena.indexOf("Á")>=0) cadena=cadena.replace("Á","%C3%81");
	while (cadena.indexOf("É")>=0) cadena=cadena.replace("É","%C3%89");
	while (cadena.indexOf("Í")>=0) cadena=cadena.replace("Í","%C3%8D");
	while (cadena.indexOf("Ó")>=0) cadena=cadena.replace("Ó","%C3%93");
	while (cadena.indexOf("Ú")>=0) cadena=cadena.replace("Ú","%C3%9A");
	
	while (cadena.indexOf(" ")>=0) cadena=cadena.replace(" ","%20");
	
	while (cadena.indexOf("ń")>=0) cadena=cadena.replace("ń","%C3%B1");
	while (cadena.indexOf("Ń")>=0) cadena=cadena.replace("Ń","%C3%91");
	
	while (cadena.indexOf("ü")>=0) cadena=cadena.replace("ü","%C3%BC");
	while (cadena.indexOf("Ü")>=0) cadena=cadena.replace("Ü","%C3%9C");
	
	
return cadena;

}

function trataCaracteresParametroReverse(cadena)
{
	while (cadena.indexOf("%23")>=0) cadena=cadena.replace("%23","#"); 
    
	while (cadena.indexOf("%C3%A1")>=0) cadena=cadena.replace("%C3%A1","á");
	while (cadena.indexOf("%C3%A9")>=0) cadena=cadena.replace("%C3%A9","é");
	while (cadena.indexOf("%C3%AD")>=0) cadena=cadena.replace("%C3%AD","í");
	while (cadena.indexOf("%C3%B3")>=0) cadena=cadena.replace("%C3%B3","ó");
	while (cadena.indexOf("%C3%BA")>=0) cadena=cadena.replace("%C3%BA","ú");
	                                                                   
	while (cadena.indexOf("%C3%81")>=0) cadena=cadena.replace("%C3%81","Á");
	while (cadena.indexOf("%C3%89")>=0) cadena=cadena.replace("%C3%89","É");
	while (cadena.indexOf("%C3%8D")>=0) cadena=cadena.replace("%C3%8D","Í");
	while (cadena.indexOf("%C3%93")>=0) cadena=cadena.replace("%C3%93","Ó");
	while (cadena.indexOf("%C3%9A")>=0) cadena=cadena.replace("%C3%9A","Ú");
	                                                              
	while (cadena.indexOf("%20")>=0) cadena=cadena.replace("%20"," "); 
	                                                              
	while (cadena.indexOf("%C3%B1")>=0) cadena=cadena.replace("%C3%B1","ń");
	while (cadena.indexOf("%C3%91")>=0) cadena=cadena.replace("%C3%91","Ń");
	                                                                   
	while (cadena.indexOf("%C3%BC")>=0) cadena=cadena.replace("%C3%BC","ü");
	while (cadena.indexOf("%C3%9C")>=0) cadena=cadena.replace("%C3%9C","Ü");
	
	
return cadena;

}




function formato_numero(numero){
	
    numero=redondea2dec(numero);
    
    if(isNaN(numero)){
        return "";
    }   

    separador_decimal=',';
    separador_miles='.';
    
    // Convertimos el punto en separador_decimal
    numero=numero.toString().replace(".", separador_decimal);

    // Añadimos los separadores de miles
    var miles=new RegExp("(-?[0-9]+)([0-9]{3})");
    while(miles.test(numero)) {
        numero=numero.replace(miles, "$1" + separador_miles + "$2");
    }
    
    
    
    return numero;
}

function numFilasTabla(idTabla)
{
	return $("#"+idTabla+" tbody tr").length;	
}

function numColumnasTabla(idTabla)
{
	return ($("#"+idTabla).find('tr')[0].cells.length);
}

   
function limpiar(text){
      text = text.toLowerCase();
      text = text.replace(/[áŕäâĺ]/, 'a');
      text = text.replace(/[éčëę]/, 'e');
      text = text.replace(/[íěďî]/, 'i');
      text = text.replace(/[óňöô]/, 'o');
      text = text.replace(/[úůüű]/, 'u');
      text = text.replace(/[ý˙]/, 'y');
      text = text.replace(/[ń]/, 'n');
      text = text.replace(/[ç]/, 'c');
      text = text.replace(/['"]/, '');
      text = text.replace(/[^a-zA-Z0-9-]/, ''); 
      text = text.replace(/\s+/, '-');
      text = text.replace(/' '/, '-');
      text = text.replace(/(_)$/, '');
      text = text.replace(/^(_)/, '');
      return text;
   }
   
function isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
}

function getURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}

function cambiaUrl(url)
{
	location.href=url;	

}


function muestraDialogoModal(idCapa)
{
	$( "#"+idCapa ).dialog({
		   modal: true, 
		   width: 400,
		   open: function(event, ui) { $(".ui-dialog-titlebar-close").hide(); }
		});	
}

function cierraDialogo(idCapa)
{
	$( "#"+idCapa  ).dialog( "close" );
}

