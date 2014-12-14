#include <errno.h>
#include <node.h>
#include <nan.h>
#include "./i2c-dev.h"
#include "./readbyte.h"

static __s32 ReadByte(int fd) {
  return i2c_smbus_read_byte(fd);
}

class ReadByteWorker : public NanAsyncWorker {
public:
  ReadByteWorker(NanCallback *callback, int fd)
    : NanAsyncWorker(callback), fd(fd) {}
  ~ReadByteWorker() {}

  void Execute() {
    byte = ReadByte(fd);
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
  __s32 byte;
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

  __s32 byte = ReadByte(fd);
  if (byte == -1) {
    return NanThrowError(strerror(errno), errno);
  }

  NanReturnValue(NanNew<v8::Integer>(byte));
}

