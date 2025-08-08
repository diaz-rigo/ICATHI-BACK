(function () {
	"use strict";
	angular
        .module("InnovatApp")
		.controller("listasEspera", listasEspera);

	listasEspera.$inject = ['$timeout', '$log', '$scope', 'tabFactory', 'DataUser', 'Restangular', 'Notificaciones', 'GaiaApalette', 'Personal', 'Maestros', 'Academias'];

	function listasEspera($timeout, $log, $scope, tabFactory, DataUser, Restangular, Notificaciones, GaiaApalette, Personal, Maestros, Academias) {
		var vm = this;
		vm.ListaAcademias = [];
		vm.arrayMaestros = [];
		
		vm.DetalleAcademia = DetalleAcademia;
		vm.CerrarDetalle = CerrarDetalle;
		vm.frmAcademias = null;
		vm.blnAgregarAcademia = false;
		vm.blnMostarDetalle = false;
		vm.DiasDeLaSemana = Academias.DiasDeLaSemana();
		vm.selectizeConfig = {
			create: false,
			maxItems: 1,
			autocomplete: false,
			valueField: 'Llave',
			labelField: 'Nombre',
			placeholder: 'Selecciona una opción'
		}
		vm.apalette = GaiaApalette;
		vm.Inscribir = Inscribir;
		vm.EliminarDeEspera = EliminarDeEspera;
		TraerListaAcademias();
		//Maestros.Buscar().then(function (data) {
		//	vm.arrayMaestros = data
		//});

		function DetalleAcademia(academia) {
			TraerAcademiaDetalles(academia);
        }
		

		function TraerListaAcademias() {
			Academias.getList({ blnSoloEnEspera: true}).then(function (data) {
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

		function Inscribir(alumno) {
			vm.AcademiaObject.Inscribir(alumno, false, false, function (data) {
				TraerAcademiaDetalles(vm.AcademiaObject);
			}, function (error) {

			});
		}

		function EliminarDeEspera(alumno) {
			vm.AcademiaObject.QuitarAlumnoEspera(alumno, function (data) {
				TraerAcademiaDetalles(vm.AcademiaObject);
			}, function (error) {

			});
		}
	};
})();
