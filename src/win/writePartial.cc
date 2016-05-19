#include "i2c.h"
#include "..\util.h"

static bool DoWritePartial(I2cDevice^ device, Array<BYTE>^ writeBuf, int* bytesWritten) {
  I2cTransferResult result = device->WritePartial(writeBuf);

  switch (result.Status) {
    case I2cTransferStatus::FullTransfer:
      *bytesWritten = result.BytesTransferred;
      break;
    case I2cTransferStatus::PartialTransfer:
      *bytesWritten = result.BytesTransferred;
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

class WritePartialWorker : public I2cAsyncWorker {
public:
    WritePartialWorker(
    Nan::Callback *callback,
    I2cDevice^ device,
    uint32 length,
    byte* block,
    v8::Local<v8::Object> &bufferHandle
  ) : I2cAsyncWorker(callback), device(device), length(length), block(block), bytesWritten(-1) {
    SaveToPersistent("buffer", bufferHandle);
  }

  ~WritePartialWorker() {}

  void Execute() {
    auto writeBuf = ref new Platform::Array<BYTE>(length);
    for (int i = 0; i < writeBuf->Length; i++) {
      writeBuf->set(i, block[i]);
    }

    if (!DoWritePartial(device, writeBuf, &bytesWritten) || bytesWritten == -1) {
      SetErrorNo(EIO);
      SetErrorSyscall("writePartial");
    }
  }

  void HandleOKCallback() {
    Nan::HandleScope scope;

    v8::Local<v8::Value> bufferHandle = GetFromPersistent("buffer");

    v8::Local<v8::Value> argv[] = {
      Nan::Null(),
      Nan::New<v8::Integer>(bytesWritten),
      bufferHandle
    };

    callback->Call(3, argv);
  }

private:
  I2cDevice^ device;
  uint32 length;
  byte* block;
  int bytesWritten;
};

NAN_METHOD(WinI2c::WritePartial) {
  if (info.Length() < 3 ||
      !info[0]->IsUint32() ||
      !info[1]->IsObject() ||
      !info[2]->IsFunction()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "writePartial",
      "incorrect arguments passed to writePartial"
      "(int length, Buffer buffer, function cb)"));
  }
   
  uint32 length = info[0]->Uint32Value();
  v8::Local<v8::Object> bufferHandle = info[1].As<v8::Object>();
  Nan::Callback *callback = new Nan::Callback(info[2].As<v8::Function>());

  byte* bufferData = (byte*)node::Buffer::Data(bufferHandle);
  size_t bufferLength = node::Buffer::Length(bufferHandle);

  if (length > I2C_SMBUS_I2C_BLOCK_MAX) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "writePartial",
      "writePartial can't write blocks with more than 32 bytes"));
  }

  if (length > bufferLength) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "writePartial",
      "buffer passed to readPartial contains less than 'length' bytes"));
  }

  WinI2c* obj = Nan::ObjectWrap::Unwrap<WinI2c>(info.This());

  Nan::AsyncQueueWorker(new WritePartialWorker(
    callback,
    obj->_i2cDevice,
    length,
    bufferData,
    bufferHandle
  ));
}

NAN_METHOD(WinI2c::WritePartialSync) {
  if (info.Length() < 2 ||
      !info[0]->IsInt32() ||
      !info[1]->IsObject()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "writePartialSync",
      "incorrect arguments passed to writePartialSync"
      "(int length, Buffer buffer)"));
  }

  uint32 length = info[0]->Uint32Value();
  v8::Local<v8::Object> bufferHandle = info[1].As<v8::Object>();
  int bytesWritten = -1;
  byte* bufferData = (byte*)node::Buffer::Data(bufferHandle);
  size_t bufferLength = node::Buffer::Length(bufferHandle);

  if (length > bufferLength) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "writePartialSync",
      "buffer passed to writePartialSync contains less than 'length' bytes"));
  }

  auto writeBuf = ref new Platform::Array<BYTE>(length);
  for (int i = 0; i < writeBuf->Length; i++) {
    writeBuf->set(i, bufferData[i]);
  }

  WinI2c* obj = Nan::ObjectWrap::Unwrap<WinI2c>(info.This());
  DoWritePartial(obj->_i2cDevice, writeBuf, &bytesWritten);

  if (bytesWritten == -1) {
    return Nan::ThrowError(Nan::ErrnoException(errno, "writePartialSync", ""));
  }

  info.GetReturnValue().Set(Nan::New<v8::Integer>(bytesWritten));
}