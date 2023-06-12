import { Component, OnInit } from '@angular/core';
import { RangeCustomEvent } from '@ionic/angular';
import { RangeValue } from '@ionic/core';
import { Sections } from './section/control.section';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Path } from './path/firebase.path';
import { Record } from './record/control.record';

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss'],
})
export class ControlComponent implements OnInit {
  section: Sections = Sections.Control;
  umbralValue: RangeValue;
  dateValue: string;
  powerValue: number;
  powerText: string;
  recordText: string;
  recordsRegistered: Record[];

  constructor(private fireDatabase: AngularFireDatabase) {}

  /**
   * El método ngOnInit se ejecuta al iniciar el componente e invoca los métodos para
   * obtener los valores de umbral, encendido/apagado y registros de fechas.
   */
  ngOnInit() {
    this.getRangeValueDatabase();
    this.getPowerValueDatabase();
    this.getDatesDatabase();
  }

  /**
   * Cambia la sección activa, se ejecuta cuando se cambia de segmento
   * @param event El evento de cambio de segmento
   */
  public segmentChanged(event: Event) {
    this.section = (event as CustomEvent).detail.value;
  }

  /**
   * Actualiza el valor del umbral, se ejecuta cuando se cambia el valor del umbral
   * @param event El evento de cambio de rango
   */
  public async rangeUmbralValue(event: Event) {
    const umbral = (event as RangeCustomEvent).detail.value;
    await this.fireDatabase.object(Path.Umbral).set(umbral);
  }

  /**
   * Obtiene la fecha seleccionada en el calendario
   * @param event El evento de cambio de fecha
   */
  public async selectedDate(event: Event) {
    /*this.dateValue = (event as CustomEvent).detail.value;
    const newRecord: Record = {
      date: this.dateValue,
      level: Math.floor(Math.random() * 50) + 1,
    };
    await this.fireDatabase.list(Path.Record).push(newRecord);*/
    this.dateValue = (event as CustomEvent).detail.value;
    this.getDatesDatabase();
  }

  /**
   * Cambia el estado de encendido/apagado del dispositivo
   */
  public async powerDevice() {
    if (!this.powerValue) {
      await this.fireDatabase.object(Path.Power).set(1);
      return;
    }
    await this.fireDatabase.object(Path.Power).set(0);
  }

  /**
   * Obtiene el valor del umbral desde la base de datos
   */
  public getRangeValueDatabase() {
    this.fireDatabase
      .object<RangeValue>(Path.Umbral)
      .valueChanges()
      .subscribe((response) => {
        this.umbralValue = response!;
      });
  }

  /**
   * Obtiene el valor de encendido/apagado desde la base de datos
   */
  public getPowerValueDatabase() {
    this.fireDatabase
      .object<number>(Path.Power)
      .valueChanges()
      .subscribe((response) => {
        this.powerValue = response!;
        this.powerText = this.powerValue ? 'Encendido' : 'Apagado';
      });
  }

  /**
   * Obtiene los registros de fechas desde la base de datos
   */
  public getDatesDatabase() {
    const currentDate = this.currentDate();
    this.fireDatabase
      .list<Record>(Path.Record)
      .valueChanges()
      .subscribe((response) => {
        if (!this.dateValue) {
          this.showRecordsDefault(currentDate, response);
          return;
        }
        this.showRecordsFilters(currentDate, response);
      });
  }

  /**
   * Muestra los registros por defecto para la fecha actual
   * @param date La fecha actual
   * @param listRecords La lista de registros
   */
  public showRecordsDefault(date: string, listRecords: Record[]) {
    this.recordsRegistered = this.filterDate(date, listRecords);
    const { textDefault } = this.textRecords(this.recordsRegistered.length);
    this.recordText = textDefault;
  }

  /**
   * Muestra los registros filtrados por la fecha seleccionada
   * @param date La fecha seleccionada
   * @param listRecords La lista de registros
   */
  public showRecordsFilters(date: string, listRecords: Record[]) {
    const dateSelected = this.formatISODate(this.dateValue);
    this.recordsRegistered = this.filterDate(dateSelected, listRecords);
    const { textDefault, textFilter } = this.textRecords(
      this.recordsRegistered.length
    );
    const text = dateSelected === date ? textDefault : textFilter;
    this.recordText = text;
  }

  /**
   * Filtra los registros por fecha
   * @param date La fecha a filtrar
   * @param array La lista de registros
   * @returns Los registros filtrados por fecha
   */
  public filterDate(date: string, array: Record[]) {
    return array.filter((record) => this.formatISODate(record.date) === date);
  }

  /**
   * Obtiene la fecha actual en el formato "YYYY-MM-DD"
   * @returns La fecha actual en el formato "YYYY-MM-DD"
   */
  public currentDate() {
    const current = new Date().toLocaleDateString('es-CO');
    const a = current.split('/').reverse();
    return `${a[0]}-0${a[1]}-${a[2]}`;
  }

  /**
   * Formatea una fecha en formato ISO "YYYY-MM-DD" a "YYYY-MM-DDTHH:mm:ss"
   * @param date La fecha a formatear
   * @returns La fecha formateada en formato "YYYY-MM-DDTHH:mm:ss"
   */
  public formatISODate(date: string) {
    return date.split('T')[0];
  }

  /**
   * Genera el texto para los registros de acuerdo al tamaño del array
   * @param sizeArray El tamaño del array de registros
   * @returns El objeto con los textos generados
   */
  public textRecords(sizeArray: number) {
    const textDefault = `Se ha activado ${sizeArray} veces hoy`;
    const textFilter = `Se activó ${sizeArray} veces`;
    return { textDefault, textFilter };
  }
}
