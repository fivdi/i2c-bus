#include <nan.h>

using namespace Platform;
using namespace Windows::Devices::Enumeration;
using namespace Windows::Devices::SerialCommunication;
using namespace Windows::Foundation;
using namespace Windows::Devices::I2c;

#define I2C_SMBUS_I2C_BLOCK_MAX	32

class WinI2c : public Nan::ObjectWrap {
public:
  static NAN_MODULE_INIT(Init);
  static NAN_METHOD(New);
  static NAN_METHOD(GetController);
  static NAN_METHOD(GetControllerSync);
  static NAN_METHOD(CloseDevice);
  static NAN_METHOD(CloseDeviceSync);
  static NAN_METHOD(ReadPartial);
  static NAN_METHOD(ReadPartialSync);
  static NAN_METHOD(WritePartial);
  static NAN_METHOD(WritePartialSync);
  static NAN_METHOD(CreateDevice);
  static NAN_METHOD(CreateDeviceSync);
  static NAN_METHOD(WriteReadPartial);
  static NAN_METHOD(WriteReadPartialSync);
  String^ GetControllerId();
  void SetControllerId(String^ controllerId);
  void SetDevice(I2cDevice^ device);

private:
  explicit WinI2c();
  ~WinI2c();
  static Nan::Persistent<v8::Function> constructor;
  I2cDevice^ _i2cDevice;
  String^ _i2cControllerId;
};