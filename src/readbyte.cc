#include <errno.h>
#include <node.h>
#include <nan.h>
#include "./i2c-dev.h"
#include "./readbyte.h"
#include "./util.h"

static __s32 ReadByte(int fd, __u8 cmd) {
  return i2c_smbus_read_byte_data(fd, cmd);
}

class ReadByteWorker : public I2cAsyncWorker {
public:
  ReadByteWorker(Nan::Callback *callback, int fd, __u8 cmd)
    : I2cAsyncWorker(callback), fd(fd), cmd(cmd) {}
  ~ReadByteWorker() {}

  void Execute() {
    byte = ReadByte(fd, cmd);
    if (byte == -1) {
      SetErrorNo(errno);
      SetErrorSyscall("readByte");
    }
  }

  void HandleOKCallback() {
    Nan::HandleScope scope;

    v8::Local<v8::Value> argv[] = {
      Nan::Null(),
      Nan::New<v8::Integer>(byte)
    };

    callback->Call(2, argv);
  }

private:
  int fd;
  __u8 cmd;
  __s32 byte;
};

NAN_METHOD(ReadByteAsync) {
  if (info.Length() < 3 || !info[0]->IsInt32() || !info[1]->IsInt32() || !info[2]->IsFunction()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "readByte",
      "incorrect arguments passed to readByte(int fd, int cmd, function cb)"));
  }

  int fd = info[0]->Int32Value();
  __u8 cmd = info[1]->Int32Value();
  Nan::Callback *callback = new Nan::Callback(info[2].As<v8::Function>());

  Nan::AsyncQueueWorker(new ReadByteWorker(callback, fd, cmd));
}

NAN_METHOD(ReadByteSync) {
  if (info.Length() < 2 || !info[0]->IsInt32() || !info[1]->IsInt32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "readByteSync",
      "incorrect arguments passed to readByteSync(int fd, int cmd)"));
  }

  int fd = info[0]->Int32Value();
  __u8 cmd = info[1]->Int32Value();

  __s32 byte = ReadByte(fd, cmd);
  if (byte == -1) {
    return Nan::ThrowError(Nan::ErrnoException(errno, "readByteSync", ""));
  }

  info.GetReturnValue().Set(Nan::New<v8::Integer>(byte));
}

