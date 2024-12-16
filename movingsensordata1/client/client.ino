/*
Author: Steven Nguyen
Date: 09/18/2024
Course: CE 4389.001

Description: This code was developed by UTDesign Team 2027 during Fall 2024 for a senior design project
this code is meant to be used on a Adafruit SAMD21 Pro RF in a remote, low power environment, communicating using the LoRa communication
protocol. The device reads sensor data and sends the data periodically, sleeping in between messages.
*/

#include "Adafruit_seesaw.h"
#include <Wire.h>
#include "wiring_private.h"  // pinPeripheral() function
#include <SPI.h>
#include <RH_RF95.h>
#include <RTCZero.h>
#include "LowPower.h"
TwoWire myWire(&sercom0, 13, 14);
#include "I2CSoilMoistureSensor.h"

#define Serial SerialUSB
#define DIGITAL_POWER_PIN0 5
#define DIGITAL_POWER_PIN1 2
#define ANALOG_POWER_PIN0 A4
#define ANALOG_POWER_PIN1 A3
#define ADC_RESOLUTION 12
#define ADC_MAX_VALUE 4095
#define ANALOG_PIN A1
// #define DEBUG  // Comment this line to disable debug mode

void powerBus(uint32_t);

RTCZero rtc;

I2CSoilMoistureSensor* sensorPtr1;
I2CSoilMoistureSensor* sensorPtr2;
#define SENSOR0_I2C_ADDR 0x22
#define SENSOR1_I2C_ADDR 0x20
RH_RF95 rf95(12, 6);
float frequency = 921.2;  // Broadcast frequency

void setup() {
  analogReadResolution(ADC_RESOLUTION);
#ifdef DEBUG
  Serial.begin(9600);
  while (!Serial)
    ;
#endif

  pinMode(DIGITAL_POWER_PIN0, OUTPUT);
  pinMode(DIGITAL_POWER_PIN1, OUTPUT);
  pinMode(ANALOG_POWER_PIN0, OUTPUT);
  pinMode(ANALOG_POWER_PIN1, OUTPUT);
  powerBus(HIGH);
  pinPeripheral(4, PIO_SERCOM);
  pinPeripheral(3, PIO_SERCOM);
  myWire.begin();
  analogReadResolution(ADC_RESOLUTION);

  // serial setup
#ifdef DEBUG
  Serial.begin(9600);
  while (!Serial)
    ;
  Serial.println("Debug mode enabled");
#endif

  // sensor setup
  sensorPtr1 = new I2CSoilMoistureSensor(SENSOR0_I2C_ADDR);
  sensorPtr1->begin();
sensorPtr2 = new I2CSoilMoistureSensor(SENSOR1_I2C_ADDR);
sensorPtr2->begin();
#ifdef DEBUG
  Serial.println("Sensor initialized successfully.");
#endif

  // RF95 setup
  if (!rf95.init()) {
#ifdef DEBUG
    Serial.println("RF95 not found");
#endif
    while (1)
      ;
  } else {
#ifdef DEBUG
    Serial.println("RF95 found");
#endif
  }

  rf95.setFrequency(frequency);
  rf95.setTxPower(23, false);

  // RTC setup
  rtc.begin();
  rtc.setTime(0, 0, 0);
  rtc.setDate(0, 0, 0);
  rtc.setAlarmTime(0, 0, 5);  // This decides how long the device will sleep
  rtc.enableAlarm(rtc.MATCH_HHMMSS);
}

void loop() {
  // Power on devices
  powerBus(HIGH);
  myWire.begin();
  sensorPtr1->begin();
  // sensorPtr2->begin();
  delay(200);



  // Read sensor data
#ifdef DEBUG
  Serial.println("reading...");
#endif
  String data1 = String(sensorPtr1->getCapacitance()) + " " + String(sensorPtr1->getTemperature() / 10.0);
  // String data = "Temp: " + String(ss0.getTemp());
  String data2 = String(sensorPtr2->getCapacitance()) + " " + String(sensorPtr2->getTemperature() / 10.0);

  // Read and average voltage
  float voltage_sum = 0;
  for (int i = 0; i < 10; i++) {
    voltage_sum += (float)analogRead(ANALOG_PIN) / ADC_MAX_VALUE * 3.3;
  }
  float voltage = voltage_sum / 5 - .12;
  // data += " " + String(voltage);
  data1 += " " + String(voltage) + " 1\r\n";
  data2 += " " + String(voltage) + " 2\r\n";
  String data = data1 + data2;
  // String data = data1;

#ifdef DEBUG
  Serial.println(data);
#endif

  rf95.send((uint8_t*)data.c_str(), data.length());
  rf95.waitPacketSent();

  // Power off devices and go to sleep
  // sensorPtr1->sleep();
  // myWire.end();
  // powerBus(LOW);
  // rf95.sleep();
  // rtc.setTime(0, 0, 0);
  // rtc.setDate(0, 0, 0);
  // rtc.standbyMode();
  delay(5000);
}

void powerBus(uint32_t toggle) {
  digitalWrite(DIGITAL_POWER_PIN0, toggle);
  digitalWrite(DIGITAL_POWER_PIN1, toggle);
  if (toggle == HIGH) {
    analogWrite(ANALOG_POWER_PIN0, 255);
    analogWrite(ANALOG_POWER_PIN1, 255);
  } else {
    analogWrite(ANALOG_POWER_PIN0, 0);
    analogWrite(ANALOG_POWER_PIN1, 0);
  }
}
