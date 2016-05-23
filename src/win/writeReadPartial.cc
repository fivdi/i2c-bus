#include "i2c.h"
#include "..\util.h"

static bool DoWriteReadPartial(I2cDevice^ device, Array<BYTE>^ writeBuf, Array<BYTE>^ readBuf, int* bytesRead) {
  I2cTransferResult result = device->WriteReadPartial(writeBuf, readBuf);

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

class WriteReadPartialWorker : public I2cAsyncWorker {
public:
    WriteReadPartialWorker(
    Nan::Callback *callback,
    I2cDevice^ device,
    byte cmd,
    uint32 length,
    byte* block,
    v8::Local<v8::Object> &bufferHandle
  ) : I2cAsyncWorker(callback), device(device), cmd(cmd), length(length), block(block), bytesRead(-1) {
    SaveToPersistent("buffer", bufferHandle);
  }

  ~WriteReadPartialWorker() {}

  void Execute() {
    auto readBuf = ref new Platform::Array<BYTE>(length);
    auto writeBuf = ref new Platform::Array<BYTE>(1);
    writeBuf->set(0, cmd);

    if (!DoWriteReadPartial(device, writeBuf, readBuf, &bytesRead) || bytesRead == -1) {
	  SetErrorNo(EIO);
      SetErrorSyscall("writeReadPartial");
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
  byte cmd;
  uint32 length;
  byte* block;
  int bytesRead;
};

NAN_METHOD(WinI2c::WriteReadPartial) {
  if (info.Length() < 4 ||
      !info[0]->IsInt32() ||
      !info[1]->IsUint32() ||
      !info[2]->IsObject() ||
      !info[3]->IsFunction()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "writeReadPartial",
      "incorrect arguments passed to writeReadPartial"
      "(int cmd, int length, Buffer buffer, function cb)"));
  }

  byte cmd = info[0]->Int32Value();
  uint32 length = info[1]->Uint32Value();
  v8::Local<v8::Object> bufferHandle = info[2].As<v8::Object>();
  Nan::Callback *callback = new Nan::Callback(info[3].As<v8::Function>());

  byte* bufferData = (byte*)node::Buffer::Data(bufferHandle);
  size_t bufferLength = node::Buffer::Length(bufferHandle);

  if (length > I2C_SMBUS_I2C_BLOCK_MAX) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "writeReadPartial",
      "writeReadPartial can't read blocks with more than 32 bytes"));
  }

  if (length > bufferLength) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "writeReadPartial",
      "buffer passed to writeReadPartial contains less than 'length' bytes"));
  }

  WinI2c* obj = Nan::ObjectWrap::Unwrap<WinI2c>(info.This());

  Nan::AsyncQueueWorker(new WriteReadPartialWorker(
    callback,
    obj->_i2cDevice,
    cmd,
    length,
    bufferData,
    bufferHandle
  ));
}

NAN_METHOD(WinI2c::WriteReadPartialSync) {
  if (info.Length() < 3 ||
      !info[0]->IsInt32() ||
      !info[1]->IsInt32() ||
      !info[2]->IsObject()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "writeReadPartialSync",
      "incorrect arguments passed to writeReadPartialSync"
      "(int cmd, int length, Buffer buffer)"));
  }

  byte cmd = info[0]->Int32Value();
  uint32 length = info[1]->Uint32Value();
  v8::Local<v8::Object> bufferHandle = info[2].As<v8::Object>();
  int bytesRead = -1;
  byte* bufferData = (byte*)node::Buffer::Data(bufferHandle);
  size_t bufferLength = node::Buffer::Length(bufferHandle);

  if (length > I2C_SMBUS_I2C_BLOCK_MAX) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "writeReadPartialSync",
      "writeReadPartialSync can't read blocks with more than 32 bytes"));
  }

  if (length > bufferLength) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "writeReadPartialSync",
      "buffer passed to writeReadPartialSync contains less than 'length' bytes"));
  }
 
  auto readBuf = ref new Platform::Array<BYTE>(length);
  auto writeBuf = ref new Platform::Array<BYTE>(1);
  writeBuf->set(0, cmd);

  WinI2c* obj = Nan::ObjectWrap::Unwrap<WinI2c>(info.This());
  DoWriteReadPartial(obj->_i2cDevice, writeBuf, readBuf, &bytesRead);

  if (bytesRead == -1) {
    return Nan::ThrowError(Nan::ErrnoException(errno, "writeReadPartialSync", ""));
  }

  for (int i = 0; i < readBuf->Length; i++) {
      bufferData[i] = readBuf[i];
  }

  info.GetReturnValue().Set(Nan::New<v8::Integer>(bytesRead));
}
