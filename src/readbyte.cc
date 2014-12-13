#include <errno.h>
#include <node.h>
#include <nan.h>
#include "./i2c-dev.h"
#include "./readbyte.h"

#include <stdio.h>

static int ReadByte(int fd) {
  return i2c_smbus_read_byte(fd);
}

class ReadByteWorker : public NanAsyncWorker {
public:
  ReadByteWorker(NanCallback *callback, int fd)
    : NanAsyncWorker(callback), fd(fd) {}
  ~ReadByteWorker() {}

  void Execute() {
    int ret = ReadByte(fd);
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
      NanNew<v8::Integer>(val)
    };

    callback->Call(2, argv);
  }

private:
  int fd;
  int val;
};

NAN_METHOD(ReadByteAsync) {
  NanScope();

  if (args.Length() < 2 || !args[0]->IsInt32() || !args[1]->IsFunction()) {
    return NanThrowError("incorrect arguments passed to readByte(int fd, function cb)");
  }

  int fd = args[0]->Int32Value();
  NanCallback *callback = new NanCallback(args[1].As<v8::Function>());

  NanAsyncQueueWorker(new ReadByteWorker(callback, fd));
  NanReturnUndefined();
}

NAN_METHOD(ReadByteSync) {
  NanScope();

  if (args.Length() < 1 || !args[0]->IsInt32()) {
    return NanThrowError("incorrect arguments passed to readByteSync(int fd)");
  }

  int fd = args[0]->Int32Value();

  int ret = ReadByte(fd);
  if (ret == -1) {
    return NanThrowError(strerror(errno), errno);
  }

  NanReturnValue(NanNew<v8::Integer>(ret));
}

