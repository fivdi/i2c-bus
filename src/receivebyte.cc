#include <errno.h>
#include <node.h>
#include <nan.h>
#include "./i2c-dev.h"
#include "./receivebyte.h"
#include "./util.h"

static __s32 ReceiveByte(int fd) {
  return i2c_smbus_read_byte(fd);
}

class ReceiveByteWorker : public Nan::AsyncWorker {
public:
  ReceiveByteWorker(Nan::Callback *callback, int fd)
    : Nan::AsyncWorker(callback), fd(fd) {}
  ~ReceiveByteWorker() {}

  void Execute() {
    byte = ReceiveByte(fd);
    if (byte == -1) {
      char buf[ERRBUFSZ];
      SetErrorMessage(strerror_r(errno, buf, ERRBUFSZ));
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
  __s32 byte;
};

NAN_METHOD(ReceiveByteAsync) {
  if (info.Length() < 2 || !info[0]->IsInt32() || !info[1]->IsFunction()) {
    return Nan::ThrowError("incorrect arguments passed to receiveByte(int fd, function cb)");
  }

  int fd = info[0]->Int32Value();
  Nan::Callback *callback = new Nan::Callback(info[1].As<v8::Function>());

  Nan::AsyncQueueWorker(new ReceiveByteWorker(callback, fd));
}

NAN_METHOD(ReceiveByteSync) {
  if (info.Length() < 1 || !info[0]->IsInt32()) {
    return Nan::ThrowError("incorrect arguments passed to receiveByteSync(int fd)");
  }

  int fd = info[0]->Int32Value();

  __s32 byte = ReceiveByte(fd);
  if (byte == -1) {
    char buf[ERRBUFSZ];
    return Nan::ThrowError(strerror_r(errno, buf, ERRBUFSZ)); // TODO - use errno also
  }

  info.GetReturnValue().Set(Nan::New<v8::Integer>(byte));
}

