#include "i2c.h"
#include "..\util.h"

static bool DoReadPartial(I2cDevice^ device, Array<BYTE>^ readBuf, int* bytesRead) {
  I2cTransferResult result = device->ReadPartial(readBuf);

  switch (result.Status) {
    case I2cTransferStatus::FullTransfer:
      *bytesRead = result.BytesTransferred;
      break;
    case I2cTransferStatus::PartialTransfer:
      *bytesRead = result.BytesTransferred;
      break;
    case I2cTransferStatus::SlaveAddressNotAcknowledged:
      wprintf(L"Slave address was not acknowledged\n");
      return false;
    default:
      wprintf(L"Invalid transfer status value\n");
      return false;
  }

  return true;
}

class ReadPartialWorker : public I2cAsyncWorker {
public:
    ReadPartialWorker(
    Nan::Callback *callback,
    I2cDevice^ device,
    uint32 length,
    byte* block,
    v8::Local<v8::Object> &bufferHandle
  ) : I2cAsyncWorker(callback), device(device), length(length), block(block), bytesRead(-1) {
    SaveToPersistent("buffer", bufferHandle);
  }

  ~ReadPartialWorker() {}

  void Execute() {
    auto readBuf = ref new Platform::Array<BYTE>(length);

    if (!DoReadPartial(device, readBuf, &bytesRead) || bytesRead == -1) {
      SetErrorNo(EIO);
      SetErrorSyscall("readPartial");
    }

    for (int i = 0; i < readBuf->Length; i++) {
      block[i] = readBuf[i];
    }
  }

  void HandleOKCallback() {
    Nan::HandleScope scope;

    v8::Local<v8::Value> bufferHandle = GetFromPersistent("buffer");

    v8::Local<v8::Value> argv[] = {
      Nan::Null(),
      Nan::New<v8::Integer>(bytesRead),
      bufferHandle
    };

    callback->Call(3, argv);
  }

private:
  I2cDevice^ device;
  uint32 length;
  byte* block;
  int bytesRead;
};

NAN_METHOD(WinI2c::ReadPartial) {
  if (info.Length() < 3 ||
      !info[0]->IsUint32() ||
      !info[1]->IsObject() ||
      !info[2]->IsFunction()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "readPartial",
      "incorrect arguments passed to readPartial"
      "(int length, Buffer buffer, function cb)"));
  }
   
  uint32 length = info[0]->Uint32Value();
  v8::Local<v8::Object> bufferHandle = info[1].As<v8::Object>();
  Nan::Callback *callback = new Nan::Callback(info[2].As<v8::Function>());

  byte* bufferData = (byte*)node::Buffer::Data(bufferHandle);
  size_t bufferLength = node::Buffer::Length(bufferHandle);

  if (length > I2C_SMBUS_I2C_BLOCK_MAX) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "readPartial",
      "readPartial can't read blocks with more than 32 bytes"));
  }

  if (length > bufferLength) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "readPartial",
      "buffer passed to readPartial contains less than 'length' bytes"));
  }

  WinI2c* obj = Nan::ObjectWrap::Unwrap<WinI2c>(info.This());

  Nan::AsyncQueueWorker(new ReadPartialWorker(
    callback,
    obj->_i2cDevice,
    length,
    bufferData,
    bufferHandle
  ));
}

NAN_METHOD(WinI2c::ReadPartialSync) {
  if (info.Length() < 2 ||
      !info[0]->IsInt32() ||
      !info[1]->IsObject()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "readPartialSync",
      "incorrect arguments passed to readPartialSync"
      "(int length, Buffer buffer)"));
  }

  uint32 length = info[0]->Uint32Value();
  v8::Local<v8::Object> bufferHandle = info[1].As<v8::Object>();
  int bytesRead = -1;
  byte* bufferData = (byte*)node::Buffer::Data(bufferHandle);
  size_t bufferLength = node::Buffer::Length(bufferHandle);

  if (length > bufferLength) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "readPartialSync",
      "buffer passed to readPartialSync contains less than 'length' bytes"));
  }

  auto readBuf = ref new Platform::Array<BYTE>(length);

  WinI2c* obj = Nan::ObjectWrap::Unwrap<WinI2c>(info.This());
  DoReadPartial(obj->_i2cDevice, readBuf, &bytesRead);

  if (bytesRead == -1) {
    return Nan::ThrowError(Nan::ErrnoException(errno, "readPartialSync", ""));
  }

  for (uint32 i = 0; i < readBuf->Length; i++) {
      bufferData[i] = readBuf[i];
  }

  info.GetReturnValue().Set(Nan::New<v8::Integer>(bytesRead));
}