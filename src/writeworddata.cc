#include <errno.h>
#include <node.h>
#include <nan.h>
#include "./i2c-dev.h"
#include "./writeworddata.h"

static int WriteWordData(int fd, int cmd, int val) {
  return i2c_smbus_write_word_data(fd, cmd, val);
}

class WriteWordDataWorker : public NanAsyncWorker {
public:
  WriteWordDataWorker(NanCallback *callback, int fd, int cmd, int val)
    : NanAsyncWorker(callback), fd(fd), cmd(cmd), val(val) {}
  ~WriteWordDataWorker() {}

  void Execute() {
    int ret = WriteWordData(fd, cmd, val);
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
  int cmd;
  int val;
};

NAN_METHOD(WriteWordDataAsync) {
  NanScope();

  if (args.Length() < 4 || !args[0]->IsInt32() || !args[1]->IsInt32() || !args[2]->IsInt32() || !args[3]->IsFunction()) {
    return NanThrowError("incorrect arguments passed to writeWordData(int fd, int cmd, int val, function cb)");
  }

  int fd = args[0]->Int32Value();
  int cmd = args[1]->Int32Value();
  int val = args[2]->Int32Value();
  NanCallback *callback = new NanCallback(args[3].As<v8::Function>());

  NanAsyncQueueWorker(new WriteWordDataWorker(callback, fd, cmd, val));
  NanReturnUndefined();
}

NAN_METHOD(WriteWordDataSync) {
  NanScope();

  if (args.Length() < 3 || !args[0]->IsInt32() || !args[1]->IsInt32() || !args[2]->IsInt32()) {
    return NanThrowError("incorrect arguments passed to writeWordDataSync(int fd, int cmd, int val)");
  }

  int fd = args[0]->Int32Value();
  int cmd = args[1]->Int32Value();
  int val = args[2]->Int32Value();

  int ret = WriteWordData(fd, cmd, val);
  if (ret == -1) {
    return NanThrowError(strerror(errno), errno);
  }

  NanReturnUndefined();
}

