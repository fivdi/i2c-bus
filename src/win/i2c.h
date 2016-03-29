#include <nan.h>

using namespace Platform;
using namespace Windows::Devices::Enumeration;
using namespace Windows::Devices::SerialCommunication;
using namespace Windows::Foundation;
using namespace Windows::Devices::I2c;

class WinI2c : public Nan::ObjectWrap {
public:
  static NAN_MODULE_INIT(Init);
  static NAN_METHOD(OpenSync);
  static NAN_METHOD(CloseSync);
  static NAN_METHOD(Read);
  static NAN_METHOD(ReadPartial);
  static NAN_METHOD(Write);
  static NAN_METHOD(WritePartial);
  static NAN_METHOD(WriteRead);
  static NAN_METHOD(WriteReadPartial);
  static NAN_METHOD(New);
  static NAN_METHOD(SetDevice);

private:
  explicit WinI2c();
  ~WinI2c();
  static Nan::Persistent<v8::Function> constructor;
  I2cDevice^ _i2cDevice;
  String^ _i2cDeviceId;
};