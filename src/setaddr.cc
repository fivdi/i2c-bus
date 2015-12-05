#include <errno.h>
#include <node.h>
#include <nan.h>
#include "./i2c-dev.h"
#include "./setaddr.h"
#include "./util.h"

static int SetAddr(int fd, int addr) {
  return ioctl(fd, I2C_SLAVE, addr);
}

class SetAddrWorker : public I2cAsyncWorker {
public:
  SetAddrWorker(Nan::Callback *callback, int fd, int addr)
    : I2cAsyncWorker(callback), fd(fd), addr(addr) {}
  ~SetAddrWorker() {}

  void Execute() {
    if (SetAddr(fd, addr) == -1) {
      SetErrorNo(errno);
      SetErrorSyscall("setAddr");
    }
  }

  void HandleOKCallback() {
    Nan::HandleScope scope;

    v8::Local<v8::Value> argv[] = {
      Nan::Null()
    };

    callback->Call(1, argv);
  }

private:
  int fd;
  int addr;
};

NAN_METHOD(SetAddrAsync) {
  if (info.Length() < 3 || !info[0]->IsInt32() || !info[1]->IsInt32() || !info[2]->IsFunction()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "setAddr",
      "incorrect arguments passed to setAddr(int fd, int addr, function cb)"));
  }

  int fd = info[0]->Int32Value();
  int addr = info[1]->Int32Value();
  Nan::Callback *callback = new Nan::Callback(info[2].As<v8::Function>());

  Nan::AsyncQueueWorker(new SetAddrWorker(callback, fd, addr));
}

NAN_METHOD(SetAddrSync) {
  if (info.Length() < 2 || !info[0]->IsInt32() || !info[1]->IsInt32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "setAddrSync",
      "incorrect arguments passed to setAddrSync(int fd, int addr)"));
  }

  int fd = info[0]->Int32Value();
  int addr = info[1]->Int32Value();

  if (SetAddr(fd, addr) != 0) {
    return Nan::ThrowError(Nan::ErrnoException(errno, "setAddrSync", ""));
  }
}

