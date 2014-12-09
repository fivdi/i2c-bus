#include <errno.h>
#include <node.h>
#include <nan.h>
#include "./i2c-dev.h"
#include "./readbytedata.h"

static int ReadByteData(int fd, int cmd) {
  return i2c_smbus_read_byte_data(fd, cmd);
}

class ReadByteDataWorker : public NanAsyncWorker {
public:
  ReadByteDataWorker(NanCallback *callback, int fd, int cmd)
    : NanAsyncWorker(callback), fd(fd), cmd(cmd) {}
  ~ReadByteDataWorker() {}

  void Execute() {
    int ret = ReadByteData(fd, cmd);
    if (ret == -1) {
      SetErrorMessage(strerror(errno));
    } else {
      val = ret;
    }
  }

  void HandleOKCallback() {
    NanScope();

    v8::Local<v8::Value> argv[] = {
      NanNull(),
      NanNew<v8::Number>(val)
    };

    callback->Call(2, argv);
  }

private:
  int fd;
  int cmd;
  int val;
};

NAN_METHOD(ReadByteDataAsync) {
  NanScope();

  int fd = args[0]->Uint32Value();
  int cmd = args[1]->Uint32Value();
  NanCallback *callback = new NanCallback(args[2].As<v8::Function>());

  NanAsyncQueueWorker(new ReadByteDataWorker(callback, fd, cmd));
  NanReturnUndefined();
}

NAN_METHOD(ReadByteDataSync) {
  NanScope();

  int fd = args[0]->Uint32Value();
  int cmd = args[1]->Uint32Value();

  int ret = ReadByteData(fd, cmd);
  if (ret == -1) {
    return NanThrowError(strerror(errno), errno);
  }

  NanReturnValue(NanNew<v8::Number>(ret));
}

