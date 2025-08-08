(function () {
	"use strict";
	angular.module("InnovatApp").controller("listasEspera", listasEspera);
	listasEspera.$inject = ["$timeout", "$log", "$scope", "tabFactory", "DataUser", "Restangular", "Notificaciones", "GaiaApalette", "Maestros", "Academias", "Avisos", "Alumnos", "Familias", "Grupos", "Unidades", "Niveles", "Puesto", "Personal", "Listado", ];
	function listasEspera($timeout, $log, $scope, tabFactory, DataUser, Restangular, Notificaciones, GaiaApalette, Maestros, Academias, Avisos, Alumnos, Familias, Grupos, Unidades, Niveles, Puesto, Personal, Listado) {
		var vm = this;
		vm.ListaAcademias = [];
		vm.arrayMaestros = [];
		vm.AvisoObject = {};
		vm.DetalleAcademia = DetalleAcademia;
		vm.CerrarDetalle = CerrarDetalle;
		vm.frmAcademias = null;
		vm.blnAgregarAcademia = false;
		vm.blnMostarDetalle = false;
		vm.DiasDeLaSemana = Academias.DiasDeLaSemana();
		vm.ConfigAlumnos = Alumnos.SelectizeConfig();
		vm.selectizeConfig = {
			create: false,
			maxItems: 1,
			autocomplete: false,
			valueField: "Llave",
			labelField: "Nombre",
			placeholder: "Selecciona una opción",
		};
		vm.apalette = GaiaApalette;
		vm.Inscribir = Inscribir;
		TraerListaAcademias();
		vm.ListaBusqueda = [];
		vm.ListaGradosInit = [];
		cargarAlumnos();
		
		function cargarAlumnos() {
			Alumnos.getList().then(function (data) {
				vm.ListaBusqueda = angular.copy(data);
			});
		}
		
		function DetalleAcademia(academia) {
			TraerAcademiaDetalles(academia);
		}
		
		function TraerListaAcademias() {
			Academias.getList({
				blnSoloEnEspera: true
			}).then(function (data) {
				vm.ListaAcademias = data;
			}, function (error) {
				Notificaciones.Error();
			});
		}
		
		function TraerAcademiaDetalles(academia) {
			academia.TraerDetalles().then(function (data) {
				vm.AcademiaObject = data;
				vm.blnMostarDetalle = true;
			}, function (error) {
				Notificaciones.Error();
			});
		}
		
		function CerrarDetalle() {
			vm.blnMostarDetalle = false;
			vm.AcademiaObject = {};
		}
		
		function GuardarAviso() {
			console.log("vm.AvisoObject", vm.AvisoObject);
			if(!vm.AvisoObject || !Array.isArray(vm.AvisoObject.Destinos) || vm.AvisoObject.Destinos.length === 0) {
				console.log("Debes agregar al menos un destinatario.");
				return;
			}
			if(!vm.AvisoObject.Titulo || !vm.AvisoObject.Contenido) {
				console.log("Título y contenido son obligatorios.");
				return;
			}
			var avisoCopia = angular.copy(vm.AvisoObject);
			console.log("avisoCopia", avisoCopia);
			Avisos.GuardarAcademia(avisoCopia, null, null).then(function (data) {
				console.log("Aviso guardado correctamente.");
				ReiniciarAviso();
			}, function (error) {
				console.log("Ocurrió un error al guardar el aviso.");
				$log.error(error);
			});
		}
		
		function ReiniciarAviso() {
			vm.AvisoObject = {
				Etiquetas: [],
				Destinos: [],
				EtiquetasSelectize: [],
				Archivos: [],
				Publicacion: null,
				Vencimiento: null,
				Notificar: true,
				Tipo: "1",
				Titulo: "",
				Contenido: "",
			};
		}
		
		function SeleccionarDestino(value) {
			var stringValue = String(value);
			if(value) {
				var destino = _.find(vm.ListaBusqueda, function (r) {
					return r.Llave == stringValue;
				});
				if(destino) {
					var DestinoExistente = _.find(vm.AvisoObject.Destinos, function (r) {
						return (r.Tipo == 5 && r.CicLlave == destino.CicLlave && r.UniLlave == destino.Grupo.Unidad.Llave && r.NivLlave == destino.Grupo.Nivel.Llave && r.GruLlave == destino.Grupo.Llave && r.AluLlave == destino.Llave);
					});
					if(!DestinoExistente) {
						var objDestino = {
							CicLlave: destino.CicLlave,
							UniLlave: destino.Grupo.Unidad.Llave,
							NivLlave: destino.Grupo.Nivel.Llave,
							GruLlave: destino.Grupo.Llave,
							AluLlave: destino.Llave,
							Valor: destino.Nombre,
							Tipo: 5,
						};
						if(!Array.isArray(vm.AvisoObject.Destinos)) {
							vm.AvisoObject.Destinos = [];
						}
						vm.AvisoObject.Destinos.push(objDestino);
					}
				}
			}
		}
		
		function formatearNombre(nombre) {
			return nombre.toLowerCase().split(" ").map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1)).join(" ");
		}
		
		function formatDate(date) {
			const d = new Date(date);
			const day = String(d.getDate()).padStart(2, "0");
			const month = String(d.getMonth() + 1).padStart(2, "0");
			const year = d.getFullYear();
			return `${day}/${month}/${year}`;
		}
		
		function Inscribir(alumno) {
			var id = alumno.Llave;
			var estudianteCompleto = _.find(vm.ListaBusqueda, function (r) {
				return r.Llave == id;
			});
			if(!estudianteCompleto && vm.ConfigAlumnos && vm.ConfigAlumnos.options) {
				if(Array.isArray(vm.ConfigAlumnos.options)) {
					estudianteCompleto = _.find(vm.ConfigAlumnos.options, function (r) {
						return r.Llave == id;
					});
				}
			}
			if(!estudianteCompleto) {
				estudianteCompleto = alumno;
				console.warn("No se encontró el alumno completo en ListaBusqueda ni en ConfigAlumnos.options. Usando el recibido:", alumno);
			}
			const nombreAlumno = formatearNombre(estudianteCompleto.NombreCorto);
			const fechaHoy = new Date();
			const fechaVencimiento = new Date(fechaHoy);
			fechaVencimiento.setDate(fechaVencimiento.getDate() + 7);
			vm.AvisoObject = {
				Etiquetas: [],
				Destinos: [],
				EtiquetasSelectize: [],
				Archivos: [],
				Publicacion: formatDate(fechaHoy),
				Vencimiento: formatDate(fechaVencimiento),
				Notificar: true,
				Tipo: "1",
				Titulo: `Inscripción de ${nombreAlumno} desde lista de espera `,
				Contenido: `
				<div style="
					background-color: #ffffff;
					border: 1px solid #e2e8f0;
					border-radius: 10px;
					padding: 20px;
					width: 100%;
					box-sizing: border-box;
					font-family: 'Segoe UI', Arial, sans-serif;
					box-shadow: 0 2px 4px rgba(0,0,0,0.05);
					margin-bottom: 15px;
				">
				<h3 style="
					margin: 0 0 15px;
					color: #1a365d;
					font-size: 18px;
					font-weight: 600;
					border-bottom: 1px solid #edf2f7;
					padding-bottom: 10px;
					">
					Confirmación de Inscripción desde lista de espera
				</h3>
				<p style="
					margin: 0 0 15px;
					color: #2d3748;
					font-size: 15px;
					line-height: 1.6;
					">
					Se ha registrado exitosamente al alumno
					<strong style="color: #2b6cb0; font-size: 16px;">
					${nombreAlumno}
					</strong>
				
					en la academia:
					<strong style="color: #2c5282; font-size: 16px;">
					${vm.AcademiaObject.Nombre}
					</strong>
				</p>
				</div>
			`,
			};
			var objDestino = {
				CicLlave: estudianteCompleto.CicLlave,
				UniLlave: estudianteCompleto.Grupo.Unidad.Llave,
				NivLlave: estudianteCompleto.Grupo.Nivel.Llave,
				GruLlave: estudianteCompleto.Grupo.Llave,
				AluLlave: estudianteCompleto.Llave,
				Valor: estudianteCompleto.NombreCorto,
				Tipo: 5,
				$$hashKey: "object:" + Math.floor(Math.random() * 10000),
			};
			vm.AvisoObject.Destinos.push(objDestino);
			SeleccionarDestino(estudianteCompleto.Llave);
			GuardarAviso();
			vm.AcademiaObject.Inscribir(alumno, false, false, function (data) {
				TraerAcademiaDetalles(vm.AcademiaObject);
			}, function (error) {});
		}
	}
})();
