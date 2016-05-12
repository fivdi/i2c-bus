#include "i2c.h"
#include <ppltasks.h>
#include <vector>
#include <iostream>

using v8::FunctionTemplate;
using namespace concurrency;
using namespace Platform;
using namespace Windows::Devices::Enumeration;

Nan::Persistent<v8::Function> WinI2c::constructor;

NAN_MODULE_INIT(WinI2c::Init) {
  v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
  tpl->SetClassName(Nan::New("WinI2c").ToLocalChecked());
  tpl->InstanceTemplate()->SetInternalFieldCount(6);

  Nan::SetPrototypeMethod(tpl, "openSync", OpenSync);
  Nan::SetPrototypeMethod(tpl, "closeSync", CloseSync);
  Nan::SetPrototypeMethod(tpl, "read", Read);
  Nan::SetPrototypeMethod(tpl, "readPartial", ReadPartial);
  Nan::SetPrototypeMethod(tpl, "write", Write);
  Nan::SetPrototypeMethod(tpl, "writePartial", WritePartial);
  Nan::SetPrototypeMethod(tpl, "writeRead", WriteRead);
  Nan::SetPrototypeMethod(tpl, "writeReadPartial", WriteReadPartial);
  Nan::SetPrototypeMethod(tpl, "setDevice", SetDevice);

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

NAN_METHOD(WinI2c::OpenSync) {
  if (info.Length() < 1 ||
      !info[0]->IsString()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "WinI2c::OpenSync",
      "incorrect arguments passed to WinI2c::OpenSync"
      "(string i2cControllerName)"));
  }

  v8::String::Utf8Value str(info[0]->ToString());
  std::string stdStr = std::string(*str);
  std::wstring stdWStr;
  stdWStr.assign(stdStr.begin(), stdStr.end());

  String^ deviceSelector = I2cDevice::GetDeviceSelector(ref new Platform::String(stdWStr.c_str()));
  DeviceInformationCollection^ i2cDeviceControllers = create_task(DeviceInformation::FindAllAsync(deviceSelector)).get();

  if (nullptr == i2cDeviceControllers) {
    return Nan::ThrowError(Nan::ErrnoException(EPERM, "WinI2c::OpenSync", "DeviceInformation::FindAllAsync failed to return controller(s)"));
  }

  WinI2c* obj = Nan::ObjectWrap::Unwrap<WinI2c>(info.This());
  obj->_i2cDeviceId = i2cDeviceControllers->GetAt(0)->Id;
}

NAN_METHOD(WinI2c::SetDevice) {
  if (info.Length() < 1 ||
      !info[0]->IsInt32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "WinI2c::SetDevice",
      "incorrect arguments passed to WinI2c::SetDevice"
      "(int deviceAddress)"));
  }

  WinI2c* obj = Nan::ObjectWrap::Unwrap<WinI2c>(info.This());

  if(nullptr == obj->_i2cDevice) {
    I2cConnectionSettings^ settings = ref new I2cConnectionSettings(info[0]->Int32Value());
    
    //TODO: Expose as properties for the user to change
    settings->BusSpeed = I2cBusSpeed::FastMode;
    settings->SharingMode = I2cSharingMode::Exclusive;
    
    obj->_i2cDevice = create_task(I2cDevice::FromIdAsync(obj->_i2cDeviceId, settings)).get();
    if (nullptr == obj->_i2cDevice) {
      return Nan::ThrowError(Nan::ErrnoException(EPERM, "WinI2c::SetDevice", "I2cDevice::FromIdAsync failed to return an i2c device"));
    }
  }
}

NAN_METHOD(WinI2c::CloseSync) {
  WinI2c* obj = Nan::ObjectWrap::Unwrap<WinI2c>(info.This());

  //From https://msdn.microsoft.com/en-us/library/windows.devices.i2c.i2cdevice.close.aspx
  // You cannot call Close methods through Visual C++ component extensions(C++ / CX) on 
  // Windows Runtime class instances where the class implemented IClosable.Instead, C++ / CX code 
  // for runtime classes should call the destructor or set the last reference to null.
  obj->_i2cDevice = nullptr;
}

NAN_METHOD(WinI2c::Read) {
  return Nan::ThrowError(Nan::ErrnoException(EPERM, "WinI2c::Read", "Not Implemented"));
}

NAN_METHOD(WinI2c::ReadPartial) {
  if (info.Length() < 2 ||
      !info[0]->IsInt32() ||
      !info[1]->IsObject()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "WinI2c::ReadPartial",
      "incorrect arguments passed to WinI2c::ReadPartial"
      "(int length, Buffer buffer)"));
  }

  uint32 length = info[0]->Uint32Value();
  v8::Local<v8::Object> bufferHandle = info[1].As<v8::Object>();
  int bytesRead = -1;
  byte* bufferData = (byte*)node::Buffer::Data(bufferHandle);
  size_t bufferLength = node::Buffer::Length(bufferHandle);

  if (length > bufferLength) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "WinI2c::ReadPartial",
      "buffer passed to WinI2c::Read contains less than 'length' bytes"));
  }

  auto readBuf = ref new Platform::Array<BYTE>(length);
  WinI2c* obj = Nan::ObjectWrap::Unwrap<WinI2c>(info.This());
  try {
    I2cTransferResult result = obj->_i2cDevice->ReadPartial(readBuf);

    switch (result.Status) {
      case I2cTransferStatus::FullTransfer:
        bytesRead = result.BytesTransferred;
        break;
      case I2cTransferStatus::PartialTransfer:
        bytesRead = result.BytesTransferred;
        wprintf(L"%d bytes partially transferred\n", bytesRead);
        break;
      case I2cTransferStatus::SlaveAddressNotAcknowledged:
        wprintf(L"Slave address was not acknowledged\n");
        break;
      default:
        wprintf(L"Invalid transfer status value\n");
    }
  }
  catch (Exception^ e) {
    return Nan::ThrowError(Nan::ErrnoException(e->HResult, "WinI2c::ReadPartial", ""));
  }

  for (int i = 0; i < readBuf->Length; i++) {
    bufferData[i] = readBuf[i];
  }

  if (bytesRead == -1) {
    return Nan::ThrowError(Nan::ErrnoException(errno, "WinI2c::ReadPartial", ""));
  }

  info.GetReturnValue().Set(Nan::New<v8::Integer>(bytesRead));
}

NAN_METHOD(WinI2c::Write) {
  if (info.Length() < 1 || !info[0]->IsArray()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "WinI2c::Write",
      "incorrect arguments passed to WinI2c::Write"));
  }

  std::vector<BYTE> bytes;
  v8::Handle<v8::Value> val;
  v8::Local<v8::Array> arr = Nan::New<v8::Array>();

  v8::Handle<v8::Array> jsArray = v8::Handle<v8::Array>::Cast(info[0]);
  for (unsigned int i = 0; i < jsArray->Length(); i++) {
    val = jsArray->Get(i);
    bytes.push_back(static_cast<BYTE>(val->Uint32Value()));
    Nan::Set(arr, i, val);
  }

  WinI2c* obj = Nan::ObjectWrap::Unwrap<WinI2c>(info.This());
  try {
    obj->_i2cDevice->Write(ArrayReference<BYTE>(bytes.data(), static_cast<unsigned int>(bytes.size())));
  } catch (Exception^ e) {
    return Nan::ThrowError(Nan::ErrnoException(e->HResult, "WinI2c::Write", ""));
  }
}

NAN_METHOD(WinI2c::WritePartial) {
  if (info.Length() < 2 ||
      !info[0]->IsInt32() ||
      !info[1]->IsObject()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "WinI2c::WritePartial",
      "incorrect arguments passed to WinI2c::WritePartial"
      "(int length, Buffer buffer)"));
  }

  uint32 length = info[0]->Uint32Value();
  v8::Local<v8::Object> bufferHandle = info[1].As<v8::Object>();
  int bytesWritten = -1;
  byte* bufferData = (byte*)node::Buffer::Data(bufferHandle);
  size_t bufferLength = node::Buffer::Length(bufferHandle);

  if (length > bufferLength) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "WinI2c::WritePartial",
      "buffer passed to WinI2c::WritePartial contains less than 'length' bytes"));
  }

  auto writeBuf = ref new Platform::Array<BYTE>(length);

  for (int i = 0; i < writeBuf->Length; i++) {
    writeBuf->set(i, bufferData[i]);
  }

  WinI2c* obj = Nan::ObjectWrap::Unwrap<WinI2c>(info.This());
  try {
    I2cTransferResult result = obj->_i2cDevice->WritePartial(writeBuf);
    switch (result.Status) {
      case I2cTransferStatus::FullTransfer:
        bytesWritten = result.BytesTransferred;
        break;
      case I2cTransferStatus::PartialTransfer:
        bytesWritten = result.BytesTransferred;
        wprintf(L"%d bytes partially transferred\n", bytesWritten);
        break;
      case I2cTransferStatus::SlaveAddressNotAcknowledged:
        wprintf(L"Slave address was not acknowledged\n");
        break;
      default:
        wprintf(L"Invalid transfer status value\n");
    }
  }
  catch (Exception^ e) {
    return Nan::ThrowError(Nan::ErrnoException(e->HResult, "WinI2c::WritePartial", ""));
  }

  if (bytesWritten == -1) {
    return Nan::ThrowError(Nan::ErrnoException(errno, "WinI2c::WritePartial", ""));
  }

  info.GetReturnValue().Set(Nan::New<v8::Integer>(bytesWritten));
}

NAN_METHOD(WinI2c::WriteRead) {
  return Nan::ThrowError(Nan::ErrnoException(EPERM, "WinI2c::WriteRead", "Not Implemented"));
}

NAN_METHOD(WinI2c::WriteReadPartial) {
  if (info.Length() < 3 ||
      !info[0]->IsInt32() ||
      !info[1]->IsInt32() ||
      !info[2]->IsObject()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "WinI2c::WriteReadPartial",
      "incorrect arguments passed to WinI2c::WriteReadPartial"
      "(int cmd, int length, Buffer buffer)"));
  }

  uint32 length = info[1]->Uint32Value();
  v8::Local<v8::Object> bufferHandle = info[2].As<v8::Object>();
  int bytesRead = -1;
  byte* bufferData = (byte*)node::Buffer::Data(bufferHandle);
  size_t bufferLength = node::Buffer::Length(bufferHandle);

  if (length > bufferLength) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "WinI2c::WriteReadPartial",
      "buffer passed to WinI2c::WriteReadPartial contains less than 'length' bytes"));
  }
  
  auto readBuf = ref new Platform::Array<BYTE>(length);
  auto writeBuf = ref new Platform::Array<BYTE>(1);
  writeBuf->set(0, info[0]->Int32Value());

  WinI2c* obj = Nan::ObjectWrap::Unwrap<WinI2c>(info.This());
  try {
    I2cTransferResult result = obj->_i2cDevice->WriteReadPartial(writeBuf, readBuf);
    switch (result.Status) {
      case I2cTransferStatus::FullTransfer:
        bytesRead = result.BytesTransferred;
        break;
      case I2cTransferStatus::PartialTransfer:
        bytesRead = result.BytesTransferred;
        wprintf(L"%d bytes partially transferred\n", bytesRead);
        break;
      case I2cTransferStatus::SlaveAddressNotAcknowledged:
        wprintf(L"Slave address was not acknowledged\n");
        break;
      default:
        wprintf(L"Invalid transfer status value\n");
    }
  }
  catch (Exception^ e) {
    return Nan::ThrowError(Nan::ErrnoException(e->HResult, "WinI2c::WriteReadPartial", ""));
  }

  for (int i = 0; i < readBuf->Length; i++) {
    bufferData[i] = readBuf[i];
  }

  if (bytesRead == -1) {
    return Nan::ThrowError(Nan::ErrnoException(errno, "WinI2c::WriteReadPartial", ""));
  }

  info.GetReturnValue().Set(Nan::New<v8::Integer>(bytesRead));
}

NODE_MODULE(i2c, WinI2c::Init)
