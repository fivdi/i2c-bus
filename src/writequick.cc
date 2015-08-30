#include <errno.h>
#include <node.h>
#include <nan.h>
#include "./i2c-dev.h"
#include "./writequick.h"
#include "./util.h"

static __s32 WriteQuick(int fd, __u8 bit) {
  return i2c_smbus_write_quick(fd, bit);
}

class WriteQuickWorker : public Nan::AsyncWorker {
public:
  WriteQuickWorker(Nan::Callback *callback, int fd, __u8 bit)
    : Nan::AsyncWorker(callback), fd(fd), bit(bit) {}
  ~WriteQuickWorker() {}

  void Execute() {
    __s32 ret = WriteQuick(fd, bit);
    if (ret == -1) {
      char buf[ERRBUFSZ];
      SetErrorMessage(strerror_r(errno, buf, ERRBUFSZ));
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
  __u8 bit;
};

NAN_METHOD(WriteQuickAsync) {
  if (info.Length() < 3 || !info[0]->IsInt32() || !info[1]->IsInt32() || !info[3]->IsFunction()) {
    return Nan::ThrowError("incorrect arguments passed to writeQuick(int fd, int bit, function cb)");
  }

  int fd = info[0]->Int32Value();
  __u8 bit = info[1]->Int32Value();
  Nan::Callback *callback = new Nan::Callback(info[2].As<v8::Function>());

  Nan::AsyncQueueWorker(new WriteQuickWorker(callback, fd, bit));
}

NAN_METHOD(WriteQuickSync) {
  if (info.Length() < 2 || !info[0]->IsInt32() || !info[1]->IsInt32()) {
    return Nan::ThrowError("incorrect arguments passed to writeQuickSync(int fd, int bit)");
  }

  int fd = info[0]->Int32Value();
  __u8 bit = info[1]->Int32Value();

  __s32 ret = WriteQuick(fd, bit);
  if (ret == -1) {
    char buf[ERRBUFSZ];
    return Nan::ThrowError(strerror_r(errno, buf, ERRBUFSZ)); // TODO - use errno also
  }
}

