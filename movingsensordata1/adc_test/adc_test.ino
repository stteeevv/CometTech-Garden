#define Serial SerialUSB
#define ADC_RESOLUTION 12
#define ADC_MAX_VALUE 4095
#define ANALOG_PIN A1
void setup() {
    Serial.begin(9600);
    analogReadResolution(ADC_RESOLUTION);

}

void loop() {
    int value = analogRead(ANALOG_PIN);
    value -= 35;
    float voltage = (float)value / ADC_MAX_VALUE * 3.3 * 2;
    Serial.print("Voltage: ");
    Serial.print(voltage);
    Serial.println(" V");
    
    delay(1000);
}