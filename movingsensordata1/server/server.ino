#include <SPI.h>
#include <RH_RF95.h> 

#define Serial SerialUSB


RH_RF95 rf95(12, 6);
float frequency = 921.2; //Broadcast frequency

void setup() {
    Serial.begin(9600);
    while(!Serial);
    if(!rf95.init()){
        Serial.println("RF95 not found");
        while(1);
    } else
        Serial.println("RF95 found");
    rf95.setFrequency(frequency);
    rf95.setTxPower(14, false);
}

void loop() {
    if (rf95.available()) {
        uint8_t buf[RH_RF95_MAX_MESSAGE_LEN];
        uint8_t len = sizeof(buf);
        if (rf95.recv(buf, &len)) {
            Serial.println((char*)buf);
        }
    }
// }

