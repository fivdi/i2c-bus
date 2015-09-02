#include <errno.h>
#include <node.h>
#include <nan.h>
#include "./i2c-dev.h"
#include "./readword.h"
#include "./util.h"

static __s32 ReadWord(int fd, __u8 cmd) {
  return i2c_smbus_read_word_data(fd, cmd);
}

class ReadWordWorker : public Nan::AsyncWorker {
public:
  ReadWordWorker(Nan::Callback *callback, int fd, __u8 cmd)
    : Nan::AsyncWorker(callback), fd(fd), cmd(cmd) {}
  ~ReadWordWorker() {}

  void Execute() {
    word = ReadWord(fd, cmd);
    if (word == -1) {
      char buf[ERRBUFSZ];
      SetErrorMessage(strerror_r(errno, buf, ERRBUFSZ));
    }
  }

  void HandleOKCallback() {
    Nan::HandleScope scope;

    v8::Local<v8::Value> argv[] = {
      Nan::Null(),
      Nan::New<v8::Integer>(word)
    };

    callback->Call(2, argv);
  }

private:
  int fd;
  __u8 cmd;
  __s32 word;
};

NAN_METHOD(ReadWordAsync) {
  if (info.Length() < 3 || !info[0]->IsInt32() || !info[1]->IsInt32() || !info[2]->IsFunction()) {
    return Nan::ThrowError("incorrect arguments passed to readWord(int fd, int cmd, function cb)");
  }

  int fd = info[0]->Int32Value();
  __u8 cmd = info[1]->Int32Value();
  Nan::Callback *callback = new Nan::Callback(info[2].As<v8::Function>());

  Nan::AsyncQueueWorker(new ReadWordWorker(callback, fd, cmd));
}

NAN_METHOD(ReadWordSync) {
  if (info.Length() < 2 || !info[0]->IsInt32() || !info[1]->IsInt32()) {
    return Nan::ThrowError("incorrect arguments passed to readWordSync(int fd, int cmd)");
  }

  int fd = info[0]->Int32Value();
  __u8 cmd = info[1]->Int32Value();

  __s32 word = ReadWord(fd, cmd);
  if (word == -1) {
    char buf[ERRBUFSZ];
    return Nan::ThrowError(strerror_r(errno, buf, ERRBUFSZ)); // TODO - use errno also
  }

  info.GetReturnValue().Set(Nan::New<v8::Integer>(word));
}

