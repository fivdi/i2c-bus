#include <errno.h>
#include <node.h>
#include <nan.h>
#include "./i2c-dev.h"
#include "./readbytedata.h"

static __s32 ReadByteData(int fd, __u8 cmd) {
  return i2c_smbus_read_byte_data(fd, cmd);
}

class ReadByteDataWorker : public NanAsyncWorker {
public:
  ReadByteDataWorker(NanCallback *callback, int fd, __u8 cmd)
    : NanAsyncWorker(callback), fd(fd), cmd(cmd) {}
  ~ReadByteDataWorker() {}

  void Execute() {
    byte = ReadByteData(fd, cmd);
    if (byte == -1) {
      SetErrorMessage(strerror(errno));
    }
  }

  void HandleOKCallback() {
    NanScope();

    v8::Local<v8::Value> argv[] = {
      NanNull(),
      NanNew<v8::Integer>(byte)
    };

    callback->Call(2, argv);
  }

private:
  int fd;
  __u8 cmd;
  __s32 byte;
};

NAN_METHOD(ReadByteDataAsync) {
  NanScope();

  if (args.Length() < 3 || !args[0]->IsInt32() || !args[1]->IsInt32() || !args[2]->IsFunction()) {
    return NanThrowError("incorrect arguments passed to readByteData(int fd, int cmd, function cb)");
  }

  int fd = args[0]->Int32Value();
  __u8 cmd = args[1]->Int32Value();
  NanCallback *callback = new NanCallback(args[2].As<v8::Function>());

  NanAsyncQueueWorker(new ReadByteDataWorker(callback, fd, cmd));
  NanReturnUndefined();
}

NAN_METHOD(ReadByteDataSync) {
  NanScope();

  if (args.Length() < 2 || !args[0]->IsInt32() || !args[1]->IsInt32()) {
    return NanThrowError("incorrect arguments passed to readByteDataSync(int fd, int cmd)");
  }

  int fd = args[0]->Int32Value();
  __u8 cmd = args[1]->Int32Value();

  __s32 byte = ReadByteData(fd, cmd);
  if (byte == -1) {
    return NanThrowError(strerror(errno), errno);
  }

  NanReturnValue(NanNew<v8::Integer>(byte));
}

