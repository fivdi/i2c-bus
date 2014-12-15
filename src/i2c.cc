#include <node.h>
#include <nan.h>
#include "./readbyte.h"
#include "./readword.h"
#include "./readbytes.h"
#include "./receivebyte.h"
#include "./sendbyte.h"
#include "./setaddr.h"
#include "./writebyte.h"
#include "./writeword.h"
#include "./writebytes.h"

void InitAll(v8::Handle<v8::Object> exports) {
  exports->Set(NanNew<v8::String>("readByteAsync"),
    NanNew<v8::FunctionTemplate>(ReadByteAsync)->GetFunction());
  exports->Set(NanNew<v8::String>("readByteSync"),
    NanNew<v8::FunctionTemplate>(ReadByteSync)->GetFunction());

  exports->Set(NanNew<v8::String>("readWordAsync"),
    NanNew<v8::FunctionTemplate>(ReadWordAsync)->GetFunction());
  exports->Set(NanNew<v8::String>("readWordSync"),
    NanNew<v8::FunctionTemplate>(ReadWordSync)->GetFunction());

  exports->Set(NanNew<v8::String>("readBytesAsync"),
    NanNew<v8::FunctionTemplate>(ReadBytesAsync)->GetFunction());
  exports->Set(NanNew<v8::String>("readBytesSync"),
    NanNew<v8::FunctionTemplate>(ReadBytesSync)->GetFunction());

  exports->Set(NanNew<v8::String>("receiveByteAsync"),
    NanNew<v8::FunctionTemplate>(ReceiveByteAsync)->GetFunction());
  exports->Set(NanNew<v8::String>("receiveByteSync"),
    NanNew<v8::FunctionTemplate>(ReceiveByteSync)->GetFunction());

  exports->Set(NanNew<v8::String>("sendByteAsync"),
    NanNew<v8::FunctionTemplate>(SendByteAsync)->GetFunction());
  exports->Set(NanNew<v8::String>("sendByteSync"),
    NanNew<v8::FunctionTemplate>(SendByteSync)->GetFunction());

  exports->Set(NanNew<v8::String>("setAddrAsync"),
    NanNew<v8::FunctionTemplate>(SetAddrAsync)->GetFunction());
  exports->Set(NanNew<v8::String>("setAddrSync"),
    NanNew<v8::FunctionTemplate>(SetAddrSync)->GetFunction());

  exports->Set(NanNew<v8::String>("writeByteAsync"),
    NanNew<v8::FunctionTemplate>(WriteByteAsync)->GetFunction());
  exports->Set(NanNew<v8::String>("writeByteSync"),
    NanNew<v8::FunctionTemplate>(WriteByteSync)->GetFunction());

  exports->Set(NanNew<v8::String>("writeWordAsync"),
    NanNew<v8::FunctionTemplate>(WriteWordAsync)->GetFunction());
  exports->Set(NanNew<v8::String>("writeWordSync"),
    NanNew<v8::FunctionTemplate>(WriteWordSync)->GetFunction());

  exports->Set(NanNew<v8::String>("writeBytesAsync"),
    NanNew<v8::FunctionTemplate>(WriteBytesAsync)->GetFunction());
  exports->Set(NanNew<v8::String>("writeBytesSync"),
    NanNew<v8::FunctionTemplate>(WriteBytesSync)->GetFunction());
}

NODE_MODULE(i2c, InitAll)

// Hack to speed up compilation.
// Originally all the cc files included below were listed in the sources
// section of binding.gyp. Including them here rather than compiling them
// individually, which is what happens if they're listed in binding.gyp,
// reduces the build time from 36s to 15s on a BBB.
#include "./readbyte.cc"
#include "./readword.cc"
#include "./readbytes.cc"
#include "./receivebyte.cc"
#include "./sendbyte.cc"
#include "./setaddr.cc"
#include "./writebyte.cc"
#include "./writeword.cc"
#include "./writebytes.cc"

