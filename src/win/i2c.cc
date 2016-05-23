#include "i2c.h"
#include <ppltasks.h>
#include <vector>
#include <iostream>
#include "..\util.h"

using v8::FunctionTemplate;
using namespace concurrency;
using namespace Platform;
using namespace Windows::Devices::Enumeration;

Nan::Persistent<v8::Function> WinI2c::constructor;

NAN_MODULE_INIT(WinI2c::Init) {
  v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
  tpl->SetClassName(Nan::New("WinI2c").ToLocalChecked());
  tpl->InstanceTemplate()->SetInternalFieldCount(6);

  Nan::SetPrototypeMethod(tpl, "getController", GetController);
  Nan::SetPrototypeMethod(tpl, "getControllerSync", GetControllerSync);
  Nan::SetPrototypeMethod(tpl, "closeDevice", CloseDevice);
  Nan::SetPrototypeMethod(tpl, "closeDeviceSync", CloseDeviceSync);
  Nan::SetPrototypeMethod(tpl, "readPartial", ReadPartial);
  Nan::SetPrototypeMethod(tpl, "readPartialSync", ReadPartialSync);
  Nan::SetPrototypeMethod(tpl, "writePartial", WritePartial);
  Nan::SetPrototypeMethod(tpl, "writePartialSync", WritePartialSync);
  Nan::SetPrototypeMethod(tpl, "createDevice", CreateDevice);
  Nan::SetPrototypeMethod(tpl, "createDeviceSync", CreateDeviceSync);
  Nan::SetPrototypeMethod(tpl, "writeReadPartial", WriteReadPartial);
  Nan::SetPrototypeMethod(tpl, "writeReadPartialSync", WriteReadPartialSync);

  constructor.Reset(Nan::GetFunction(tpl).ToLocalChecked());
  Nan::Set(target, Nan::New("WinI2c").ToLocalChecked(), Nan::GetFunction(tpl).ToLocalChecked());
}

WinI2c::WinI2c() {
  RoInitialize(RO_INIT_MULTITHREADED);
}

WinI2c::~WinI2c() {
  RoUninitialize();
}

NAN_METHOD(WinI2c::New) {
  if (info.IsConstructCall()) {
    WinI2c *obj = new WinI2c();
    obj->Wrap(info.This());
    info.GetReturnValue().Set(info.This());
  }
  else {
    const int argc = 1;
    v8::Local<v8::Value> argv[argc] = { info[0] };
    v8::Local<v8::Function> cons = Nan::New(constructor);
    info.GetReturnValue().Set(cons->NewInstance(argc, argv));
  }
}

class GetControllerWorker : public I2cAsyncWorker {
public:
    GetControllerWorker(
    Nan::Callback *callback,
    WinI2c* obj,
    std::wstring controllerName
  ) : I2cAsyncWorker(callback), obj(obj), controllerName(controllerName) { }

  ~GetControllerWorker() {}

  void Execute() {   
    String^ deviceSelector = I2cDevice::GetDeviceSelector(ref new Platform::String(controllerName.c_str()));
    DeviceInformationCollection^ i2cDeviceControllers = create_task(DeviceInformation::FindAllAsync(deviceSelector)).get();
    
    if (nullptr == i2cDeviceControllers) {
      SetErrorNo(EPERM);
      SetErrorSyscall("getController");
      return;
    }

    obj->SetControllerId(i2cDeviceControllers->GetAt(0)->Id);
  }

  void HandleOKCallback() {
    Nan::HandleScope scope;
    v8::Local<v8::Value> argv[] = { Nan::Null() };
    callback->Call(1, argv);
  }

private:
  WinI2c* obj;
  std::wstring controllerName;
};

NAN_METHOD(WinI2c::GetController) {
  if (info.Length() < 1 ||
      !info[0]->IsString() ||
      !info[1]->IsFunction()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "getController",
      "incorrect arguments passed to getController"
      "(string i2cControllerName, function cb)"));
  }

  v8::String::Utf8Value str(info[0]->ToString());
  std::string stdStr = std::string(*str);
  std::wstring controllerName;
  controllerName.assign(stdStr.begin(), stdStr.end());

  Nan::Callback *callback = new Nan::Callback(info[1].As<v8::Function>());
  WinI2c* obj = Nan::ObjectWrap::Unwrap<WinI2c>(info.This());
  
  Nan::AsyncQueueWorker(new GetControllerWorker(callback, obj, controllerName));
}

NAN_METHOD(WinI2c::GetControllerSync) {
  if (info.Length() < 1 ||
      !info[0]->IsString()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "getControllerSync",
      "incorrect arguments passed to getControllerSync"
      "(string i2cControllerName)"));
  }

  v8::String::Utf8Value str(info[0]->ToString());
  std::string stdStr = std::string(*str);
  std::wstring stdWStr;
  stdWStr.assign(stdStr.begin(), stdStr.end());

  String^ deviceSelector = I2cDevice::GetDeviceSelector(ref new Platform::String(stdWStr.c_str()));
  DeviceInformationCollection^ i2cDeviceControllers = create_task(DeviceInformation::FindAllAsync(deviceSelector)).get();

  if (nullptr == i2cDeviceControllers) {
    return Nan::ThrowError(Nan::ErrnoException(EPERM, "getControllerSync", "DeviceInformation::FindAllAsync failed to return controller(s)"));
  }

  WinI2c* obj = Nan::ObjectWrap::Unwrap<WinI2c>(info.This());
  obj->_i2cControllerId = i2cDeviceControllers->GetAt(0)->Id;
}

class CreateDeviceWorker : public I2cAsyncWorker {
public:
    CreateDeviceWorker(
        Nan::Callback *callback,
        WinI2c* obj,
        I2cConnectionSettings^ settings
  ) : I2cAsyncWorker(callback), obj(obj), settings(settings) { }

  ~CreateDeviceWorker() {}

  void Execute() {
    I2cDevice^ device = create_task(I2cDevice::FromIdAsync(obj->GetControllerId(), settings)).get();
    if (nullptr == device) {
      SetErrorNo(EPERM);
      SetErrorSyscall("createDevice");
      return;
    } else {
        obj->SetDevice(device);
    }
  }

  void HandleOKCallback() {
      Nan::HandleScope scope;
      v8::Local<v8::Value> argv[] = { Nan::Null() };
      callback->Call(1, argv);
  }

private:
  WinI2c* obj;
  I2cConnectionSettings^ settings;
};

NAN_METHOD(WinI2c::CreateDevice) {
  if (info.Length() < 3 ||
      !info[0]->IsInt32() ||
      !info[1]->IsInt32() ||
      !info[2]->IsInt32() ||
      !info[3]->IsFunction()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "createDevice",
      "incorrect arguments passed to createDevice"
      "(int deviceAddress, int I2cBusSpeed enum value, int I2cSharingMode enum value, function cb)"));
  }

  WinI2c* obj = Nan::ObjectWrap::Unwrap<WinI2c>(info.This());

  if(nullptr == obj->_i2cDevice) {
    I2cConnectionSettings^ settings = ref new I2cConnectionSettings(info[0]->Int32Value());
    
    int busSpeed = info[1]->Uint32Value();
    if (busSpeed < 0 || busSpeed > 1) {
      return Nan::ThrowError(Nan::ErrnoException(EPERM, "createDevice",
        "Bus speed out of range. 0=StandardMode, 1=FastMode"));
    }
    int sharingMode = info[2]->Uint32Value();
    if (sharingMode < 0 || sharingMode > 1) {
      return Nan::ThrowError(Nan::ErrnoException(EPERM, "createDevice",
        "Sharing mode out of range. 0=Exclusive, 1=Shared "));
    }
    settings->BusSpeed = static_cast<I2cBusSpeed>(busSpeed);
    settings->SharingMode = static_cast<I2cSharingMode>(sharingMode);

    Nan::Callback *callback = new Nan::Callback(info[3].As<v8::Function>());

    Nan::AsyncQueueWorker(new CreateDeviceWorker(callback, obj, settings));
  }
}

NAN_METHOD(WinI2c::CreateDeviceSync) {
  if (info.Length() < 3 ||
      !info[0]->IsInt32() ||
      !info[1]->IsInt32() ||
      !info[2]->IsInt32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "createDeviceSync",
      "incorrect arguments passed to createDeviceSync"
      "(int deviceAddress, int I2cBusSpeed enum value, int I2cSharingMode enum value)"));
  }

  WinI2c* obj = Nan::ObjectWrap::Unwrap<WinI2c>(info.This());

  if(nullptr == obj->_i2cDevice) {
    I2cConnectionSettings^ settings = ref new I2cConnectionSettings(info[0]->Int32Value());
    
    int busSpeed = info[1]->Uint32Value();
    if (busSpeed < 0 || busSpeed > 1) {
      return Nan::ThrowError(Nan::ErrnoException(EPERM, "createDeviceSync",
        "Bus speed out of range. 0=StandardMode, 1=FastMode"));
    }
    int sharingMode = info[2]->Uint32Value();
    if (sharingMode < 0 || sharingMode > 1) {
      return Nan::ThrowError(Nan::ErrnoException(EPERM, "createDeviceSync",
        "Sharing mode out of range. 0=Exclusive, 1=Shared "));
    }
    settings->BusSpeed = static_cast<I2cBusSpeed>(busSpeed);
    settings->SharingMode = static_cast<I2cSharingMode>(sharingMode);
    
    obj->_i2cDevice = create_task(I2cDevice::FromIdAsync(obj->_i2cControllerId, settings)).get();
    if (nullptr == obj->_i2cDevice) {
      return Nan::ThrowError(Nan::ErrnoException(EPERM, "createDeviceSync",
        "I2cDevice::FromIdAsync failed to return an i2c device"));
    }
  }
}

NAN_METHOD(WinI2c::CloseDevice) {
    WinI2c* obj = Nan::ObjectWrap::Unwrap<WinI2c>(info.This());

    //From https://msdn.microsoft.com/en-us/library/windows.devices.i2c.i2cdevice.close.aspx
    // You cannot call Close methods through Visual C++ component extensions(C++ / CX) on 
    // Windows Runtime class instances where the class implemented IClosable.Instead, C++ / CX code 
    // for runtime classes should call the destructor or set the last reference to null.
    obj->_i2cDevice = nullptr;
}

NAN_METHOD(WinI2c::CloseDeviceSync) {
  WinI2c* obj = Nan::ObjectWrap::Unwrap<WinI2c>(info.This());

  //From https://msdn.microsoft.com/en-us/library/windows.devices.i2c.i2cdevice.close.aspx
  // You cannot call Close methods through Visual C++ component extensions(C++ / CX) on 
  // Windows Runtime class instances where the class implemented IClosable.Instead, C++ / CX code 
  // for runtime classes should call the destructor or set the last reference to null.
  obj->_i2cDevice = nullptr;
}

void WinI2c::SetControllerId(String^ controllerId) {
  _i2cControllerId = controllerId;
}

String^ WinI2c::GetControllerId() {
  return _i2cControllerId;
}

void WinI2c::SetDevice(I2cDevice^ device) {
  _i2cDevice = device;
}

NODE_MODULE(i2c, WinI2c::Init)
