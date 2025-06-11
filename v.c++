const int trigpin=26;
const int ecopin=25;

long duration;
int direction;
void setup(){
    pinMode(trigpin,OUTPUT);
    pinMode(echopin,INPUT);
    serial.begin(115200);
}
void loop(){
    digitalWrite(trigpin,LOW);
    
}