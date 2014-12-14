#include <errno.h>
#include <node.h>
#include <nan.h>
#include "./i2c-dev.h"
#include "./writeworddata.h"

static __s32 WriteWordData(int fd, __u8 cmd, __u16 word) {
  return i2c_smbus_write_word_data(fd, cmd, word);
}

class WriteWordDataWorker : public NanAsyncWorker {
public:
  WriteWordDataWorker(NanCallback *callback, int fd, __u8 cmd, __u16 word)
    : NanAsyncWorker(callback), fd(fd), cmd(cmd), word(word) {}
  ~WriteWordDataWorker() {}

  void Execute() {
    __s32 ret = WriteWordData(fd, cmd, word);
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
  __u16 word;
};

NAN_METHOD(WriteWordDataAsync) {
  NanScope();

  if (args.Length() < 4 || !args[0]->IsInt32() || !args[1]->IsInt32() || !args[2]->IsInt32() || !args[3]->IsFunction()) {
    return NanThrowError("incorrect arguments passed to writeWordData(int fd, int cmd, int val, function cb)");
  }

  int fd = args[0]->Int32Value();
  __u8 cmd = args[1]->Int32Value();
  __u16 word = args[2]->Int32Value();
  NanCallback *callback = new NanCallback(args[3].As<v8::Function>());

  NanAsyncQueueWorker(new WriteWordDataWorker(callback, fd, cmd, word));
  NanReturnUndefined();
}

NAN_METHOD(WriteWordDataSync) {
  NanScope();

  if (args.Length() < 3 || !args[0]->IsInt32() || !args[1]->IsInt32() || !args[2]->IsInt32()) {
    return NanThrowError("incorrect arguments passed to writeWordDataSync(int fd, int cmd, int val)");
  }

  int fd = args[0]->Int32Value();
  __u8 cmd = args[1]->Int32Value();
  __u16 word = args[2]->Int32Value();

  __s32 ret = WriteWordData(fd, cmd, word);
  if (ret == -1) {
    return NanThrowError(strerror(errno), errno);
  }

  NanReturnUndefined();
}

