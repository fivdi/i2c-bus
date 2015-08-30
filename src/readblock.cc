#include <errno.h>
#include <node.h>
#include <nan.h>
#include "./i2c-dev.h"
#include "./readblock.h"
#include "./util.h"

static __s32 ReadBlock(int fd, __u8 cmd, __u8 *block) {
  return i2c_smbus_read_block_data(fd, cmd, block);
}

class ReadBlockWorker : public Nan::AsyncWorker {
public:
  ReadBlockWorker(
    Nan::Callback *callback,
    int fd,
    __u8 cmd,
    __u8* block,
    v8::Local<v8::Object> &bufferHandle
  ) : Nan::AsyncWorker(callback), fd(fd), cmd(cmd), block(block), bytesRead(0) {
    SaveToPersistent("buffer", bufferHandle);
  }

  ~ReadBlockWorker() {}

  void Execute() {
    bytesRead = ReadBlock(fd, cmd, block);
    if (bytesRead == -1) {
      char buf[ERRBUFSZ];
      SetErrorMessage(strerror_r(errno, buf, ERRBUFSZ));
    }
  }

  void HandleOKCallback() {
    Nan::HandleScope scope;

    v8::Local<v8::Value> bufferHandle = GetFromPersistent("buffer");

    v8::Local<v8::Value> argv[] = {
      Nan::Null(),
      Nan::New<v8::Integer>(bytesRead),
      bufferHandle
    };

    callback->Call(3, argv);
  }

private:
  int fd;
  __u8 cmd;
  __u8* block;
  __s32 bytesRead;
};

NAN_METHOD(ReadBlockAsync) {
  if (info.Length() < 4 ||
      !info[0]->IsInt32() ||
      !info[1]->IsInt32() ||
      !info[2]->IsObject() ||
      !info[3]->IsFunction()) {
    return Nan::ThrowError("incorrect arguments passed to readBlock"
      "(int fd, int cmd, Buffer buffer, function cb)");
  }

  int fd = info[0]->Int32Value();
  __u8 cmd = info[1]->Int32Value();
  v8::Local<v8::Object> bufferHandle = info[2].As<v8::Object>();
  Nan::Callback *callback = new Nan::Callback(info[3].As<v8::Function>());

  __u8* bufferData = (__u8*) node::Buffer::Data(bufferHandle);
  size_t bufferLength = node::Buffer::Length(bufferHandle);

  if (bufferLength < 1) {
    return Nan::ThrowError("buffer passed to readBlock "
      "has no space for reading data");
  }

  Nan::AsyncQueueWorker(new ReadBlockWorker(
    callback,
    fd,
    cmd,
    bufferData,
    bufferHandle
  ));
}

NAN_METHOD(ReadBlockSync) {
  if (info.Length() < 3 ||
      !info[0]->IsInt32() ||
      !info[1]->IsInt32() ||
      !info[2]->IsObject()) {
    return Nan::ThrowError("incorrect arguments passed to readBlockSync"
      "(int fd, int cmd, Buffer buffer)");
  }

  int fd = info[0]->Int32Value();
  __u8 cmd = info[1]->Int32Value();
  v8::Local<v8::Object> bufferHandle = info[2].As<v8::Object>();

  __u8* bufferData = (__u8*) node::Buffer::Data(bufferHandle);
  size_t bufferLength = node::Buffer::Length(bufferHandle);

  if (bufferLength < 1) {
    return Nan::ThrowError("buffer passed to readBlockSync "
      "has no space for reading data");
  }

  __s32 bytesRead = ReadBlock(fd, cmd, bufferData);
  if (bytesRead == -1) {
    char buf[ERRBUFSZ];
    return Nan::ThrowError(strerror_r(errno, buf, ERRBUFSZ)); // TODO - use errno also
  }

  info.GetReturnValue().Set(Nan::New<v8::Integer>(bytesRead));
}

