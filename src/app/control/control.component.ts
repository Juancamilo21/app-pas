import { Component, OnInit, ViewChild } from '@angular/core';
import {
  IonRadioGroup,
  IonSegment,
  RadioGroupCustomEvent,
} from '@ionic/angular';
import { Sections } from './section/control.section';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Path } from './path/firebase.path';
import { Record } from './record/control.record';
import { Platform } from '@ionic/angular';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss'],
})
export class ControlComponent implements OnInit {
  @ViewChild(IonSegment) segment: IonSegment;
  @ViewChild(IonRadioGroup) radioButton: IonRadioGroup;
  radioValue: string;
  section: Sections;
  dateValue: string;
  powerValue: number;
  powerText: string;
  recordText: string;
  recordsRegistered: Record[];

  constructor(
    private fireDatabase: AngularFireDatabase,
    private platform: Platform
  ) {}

  /**
   * El método ngOnInit se ejecuta al iniciar el componente e invoca los métodos para
   * obtener los valores de umbral, encendido/apagado y registros de fechas.
   */
  ngOnInit() {
    this.getPowerValueDatabase();
    this.getDatesDatabase();
    this.navigatorBackButton();
    this.getAudioValueDatabase();
  }

  /**
   * Método del ciclo de vida que se ejecuta cuando la aplicación se ha cargado completamente y se ha convertido en la sección activa.
   * Establece el valor del segmento en "Control" y la sección en "Control".
   */
  public ionViewDidEnter() {
    this.segment.value = Sections.Control;
    this.section = Sections.Control;
  }

  /**
   * Cambia la sección activa, se ejecuta cuando se cambia de segmento
   * @param event El evento de cambio de segmento
   */
  public segmentChanged(event: Event) {
    this.section = (event as CustomEvent).detail.value;
    this.getAudioValueDatabase();
  }

  /**
   * Maneja el evento de selección de audio y registra el valor seleccionado en la base de datos.
   * @param event El evento de selección de audio.
   */
  public selectedAudio(event: Event) {
    const radio = Number((event as RadioGroupCustomEvent).detail.value);
    this.registerAudio(radio);
  }

  /**
   * Registra el valor de audio en la base de datos.
   * @param value El valor de audio a registrar.
   */
  public async registerAudio(value: number) {
    await this.fireDatabase.object(Path.Audio).set(value);
  }

  /**
   * Obtiene el valor de audio desde la base de datos y actualiza el estado del radio button.
   */
  public getAudioValueDatabase() {
    this.fireDatabase
      .object<number>(Path.Audio)
      .valueChanges()
      .subscribe((response) => {
        this.radioButton.value = response!.toString();
      });
  }

  /**
   * Maneja el evento del botón de retroceso del dispositivo móvil.
   * Si la sección actual no es "Control", cambia al segmento "Control" y establece la sección en "Control".
   * Si la sección actual es "Control", sale de la aplicación.
   */
  public navigatorBackButton() {
    this.platform.backButton.subscribe(() => {
      if (this.section !== Sections.Control) {
        this.segment.value = Sections.Control;
        this.section = Sections.Control;
        this.getAudioValueDatabase();
        return;
      }
      App.exitApp();
    });
  }

  /**
   * Obtiene la fecha seleccionada en el calendario
   * @param event El evento de cambio de fecha
   */
  public selectedDate(event: Event) {
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
    this.recordsRegistered = resultFilters;
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
    this.recordsRegistered = resultFilters;
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
    return `${a[0]}-${a[1].toString().padStart(2, '0')}-${a[2]
      .toString()
      .padStart(2, '0')}`;
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
    const volt = level * (5.0 / level);
    const dB = 20 * Math.log10(volt);
    return dB >= 0 ? Number(dB.toFixed(1)) : 0;
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
