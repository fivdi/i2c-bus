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

  int fd = args[0]->Uint32Value();
  int cmd = args[1]->Uint32Value();
  int val = args[2]->Uint32Value();
  NanCallback *callback = new NanCallback(args[3].As<v8::Function>());

  NanAsyncQueueWorker(new WriteWordDataWorker(callback, fd, cmd, val));
  NanReturnUndefined();
}

NAN_METHOD(WriteWordDataSync) {
  NanScope();

  int fd = args[0]->Uint32Value();
  int cmd = args[1]->Uint32Value();
  int val = args[2]->Uint32Value();

  int ret = WriteWordData(fd, cmd, val);
  if (ret == -1) {
    return NanThrowError(strerror(errno), errno);
  }

  NanReturnUndefined();
}

