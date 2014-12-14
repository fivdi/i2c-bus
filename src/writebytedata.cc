#include <errno.h>
#include <node.h>
#include <nan.h>
#include "./i2c-dev.h"
#include "./writebytedata.h"

static __s32 WriteByteData(int fd, __u8 cmd, __u8 byte) {
  return i2c_smbus_write_byte_data(fd, cmd, byte);
}

class WriteByteDataWorker : public NanAsyncWorker {
public:
  WriteByteDataWorker(NanCallback *callback, int fd, __u8 cmd, __u8 byte)
    : NanAsyncWorker(callback), fd(fd), cmd(cmd), byte(byte) {}
  ~WriteByteDataWorker() {}

  void Execute() {
    __s32 ret = WriteByteData(fd, cmd, byte);
    if (ret == -1) {
      SetErrorMessage(strerror(errno));
    }
  }

  void HandleOKCallback() {
    NanScope();

    v8::Local<v8::Value> argv[] = {
      NanNull()
    };

    callback->Call(1, argv);
  }

private:
  int fd;
  __u8 cmd;
  __u8 byte;
};

NAN_METHOD(WriteByteDataAsync) {
  NanScope();

  if (args.Length() < 4 || !args[0]->IsInt32() || !args[1]->IsInt32() || !args[2]->IsInt32() || !args[3]->IsFunction()) {
    return NanThrowError("incorrect arguments passed to writeByteData(int fd, int cmd, int val, function cb)");
  }

  int fd = args[0]->Int32Value();
  __u8 cmd = args[1]->Int32Value();
  __u8 byte = args[2]->Int32Value();
  NanCallback *callback = new NanCallback(args[3].As<v8::Function>());

  NanAsyncQueueWorker(new WriteByteDataWorker(callback, fd, cmd, byte));
  NanReturnUndefined();
}

NAN_METHOD(WriteByteDataSync) {
  NanScope();

  if (args.Length() < 3 || !args[0]->IsInt32() || !args[1]->IsInt32() || !args[2]->IsInt32()) {
    return NanThrowError("incorrect arguments passed to writeByteDataSync(int fd, int cmd, int val)");
  }

  int fd = args[0]->Int32Value();
  __u8 cmd = args[1]->Int32Value();
  __u8 byte = args[2]->Int32Value();

  __s32 ret = WriteByteData(fd, cmd, byte);
  if (ret == -1) {
    return NanThrowError(strerror(errno), errno);
  }

  NanReturnUndefined();
}

