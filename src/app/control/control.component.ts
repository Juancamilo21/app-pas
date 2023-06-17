import { Component, OnInit } from '@angular/core';
import { RangeCustomEvent } from '@ionic/angular';
import { RangeValue } from '@ionic/core';
import { Sections } from './section/control.section';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Path } from './path/firebase.path';
import { Record, RecorddB } from './record/control.record';
import { BasicStatistics } from './statistics/control.statistics';

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss'],
})
export class ControlComponent implements OnInit {
  section: Sections = Sections.Control;
  umbralAnalog: RangeValue;
  umbraldB: number;
  dateValue: string;
  powerValue: number;
  powerText: string;
  recordText: string;
  recordsRegistered: RecorddB[];
  statistics: BasicStatistics;

  constructor(private fireDatabase: AngularFireDatabase) {}

  /**
   * El método ngOnInit se ejecuta al iniciar el componente e invoca los métodos para
   * obtener los valores de umbral, encendido/apagado y registros de fechas.
   */
  async ngOnInit() {
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
        this.umbralAnalog = response!;
        this.umbraldB = this.calculateDecibels(Number(this.umbralAnalog));
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
    const resultFilters = this.filterDate(date, listRecords);
    this.recordsRegistered = this.recordsdBValues(resultFilters);
    this.statistics = this.basicStatistics(this.recordsRegistered);
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
    const resultFilters = this.filterDate(dateSelected, listRecords);
    this.recordsRegistered = this.recordsdBValues(resultFilters);
    this.statistics = this.basicStatistics(this.recordsRegistered);
    console.log(this.statistics);
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
   * Calcula los decibelios (dB) a partir de un nivel analógico.
   * @param level El nivel analógico para el cálculo de decibelios.
   * @returns El valor de decibelios calculado.
   */
  public calculateDecibels(level: number) {
    const min = 2900;
    const max = 3100;
    const valueMaxMin = max - min;
    const volt = level * (5.0 / valueMaxMin);
    const dB = 20 * Math.log10(volt);
    return dB >= 0 ? Number(dB.toFixed(1)) : 0;
  }

  /**
   * Agrega los valores de decibelios a los registros existentes.
   * @param records Los registros a los que se les agregarán los valores de decibelios.
   * @returns Un nuevo arreglo de registros que incluye los valores de decibelios.
   */
  public recordsdBValues(records: Record[]) {
    const recordsdB: RecorddB[] = [];
    records.forEach((record) => {
      const dB = this.calculateDecibels(record.level);
      recordsdB.push({ ...record, dB });
    });
    return recordsdB;
  }

  /**
   * Calcula las estadísticas básicas a partir de los registros de sonido.
   * @param records Los registros de sonido.
   * @returns Un objeto que contiene las estadísticas básicas.
   */
  public basicStatistics(records: RecorddB[]): BasicStatistics {
    const maxAnalog = this.maxLevel(records, 0, (a, b) => a > b);
    const minAnalog = this.maxLevel(records, maxAnalog, (a, b) => a < b);
    const rangeAnalog = this.rangeLevel(maxAnalog, minAnalog);
    const meanAnalog = Number(this.meanLevel(records).toFixed(2));
    const maxdB = this.calculateDecibels(maxAnalog);
    const mindB = this.calculateDecibels(minAnalog);
    const rangedB = this.calculateDecibels(rangeAnalog);
    const meandB = this.calculateDecibels(meanAnalog);
    return {
      maxAnalog,
      minAnalog,
      rangeAnalog,
      meanAnalog,
      maxdB,
      mindB,
      rangedB,
      meandB,
    };
  }

  /**
   * Obtiene el valor máximo y minimo de nivel analógico en los registros de sonido.
   * @param records Los registros de sonido.
   * @param init El valor inicial de comparación.
   * @param compare La función de comparación para determinar el máximo y minimo.
   * @returns El valor máximo o minimo de nivel analógico.
   */
  public maxLevel(
    records: RecorddB[],
    init: number,
    compare: (a: number, b: number) => boolean
  ) {
    let value = init;
    records.forEach((record) => {
      if (compare(record.level, value)) value = record.level;
    });
    return value;
  }

  /**
   * Calcula el rango de nivel analógico a partir del valor máximo y mínimo.
   * @param max El valor máximo de nivel analógico.
   * @param min El valor mínimo de nivel analógico.
   * @returns El rango de nivel analógico.
   */
  public rangeLevel(max: number, min: number) {
    return max - min;
  }

  /**
   * Calcula el valor medio de nivel analógico en los registros de sonido.
   * @param records Los registros de sonido.
   * @returns El valor medio de nivel analógico.
   */
  public meanLevel(records: RecorddB[]) {
    const sum = records.reduce((total, record) => total + record.level, 0);
    return records.length > 0 ? sum / records.length : 0;
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
