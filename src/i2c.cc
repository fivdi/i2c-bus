#include <node.h>
#include <nan.h>
#include "./readbyte.h"
#include "./readbytedata.h"
#include "./readworddata.h"
#include "./readi2cblockdata.h"
#include "./setaddr.h"
#include "./writebyte.h"
#include "./writebytedata.h"
#include "./writeworddata.h"
#include "./writei2cblockdata.h"

void InitAll(v8::Handle<v8::Object> exports) {
  exports->Set(NanNew<v8::String>("readByteAsync"),
    NanNew<v8::FunctionTemplate>(ReadByteAsync)->GetFunction());
  exports->Set(NanNew<v8::String>("readByteSync"),
    NanNew<v8::FunctionTemplate>(ReadByteSync)->GetFunction());

  exports->Set(NanNew<v8::String>("readByteDataAsync"),
    NanNew<v8::FunctionTemplate>(ReadByteDataAsync)->GetFunction());
  exports->Set(NanNew<v8::String>("readByteDataSync"),
    NanNew<v8::FunctionTemplate>(ReadByteDataSync)->GetFunction());

  exports->Set(NanNew<v8::String>("readWordDataAsync"),
    NanNew<v8::FunctionTemplate>(ReadWordDataAsync)->GetFunction());
  exports->Set(NanNew<v8::String>("readWordDataSync"),
    NanNew<v8::FunctionTemplate>(ReadWordDataSync)->GetFunction());

  exports->Set(NanNew<v8::String>("readI2cBlockDataAsync"),
    NanNew<v8::FunctionTemplate>(ReadI2cBlockDataAsync)->GetFunction());
  exports->Set(NanNew<v8::String>("readI2cBlockDataSync"),
    NanNew<v8::FunctionTemplate>(ReadI2cBlockDataSync)->GetFunction());

  exports->Set(NanNew<v8::String>("setAddrAsync"),
    NanNew<v8::FunctionTemplate>(SetAddrAsync)->GetFunction());
  exports->Set(NanNew<v8::String>("setAddrSync"),
    NanNew<v8::FunctionTemplate>(SetAddrSync)->GetFunction());

  exports->Set(NanNew<v8::String>("writeByteAsync"),
    NanNew<v8::FunctionTemplate>(WriteByteAsync)->GetFunction());
  exports->Set(NanNew<v8::String>("writeByteSync"),
    NanNew<v8::FunctionTemplate>(WriteByteSync)->GetFunction());

  exports->Set(NanNew<v8::String>("writeByteDataAsync"),
    NanNew<v8::FunctionTemplate>(WriteByteDataAsync)->GetFunction());
  exports->Set(NanNew<v8::String>("writeByteDataSync"),
    NanNew<v8::FunctionTemplate>(WriteByteDataSync)->GetFunction());

  exports->Set(NanNew<v8::String>("writeWordDataAsync"),
    NanNew<v8::FunctionTemplate>(WriteWordDataAsync)->GetFunction());
  exports->Set(NanNew<v8::String>("writeWordDataSync"),
    NanNew<v8::FunctionTemplate>(WriteWordDataSync)->GetFunction());

  exports->Set(NanNew<v8::String>("writeI2cBlockDataAsync"),
    NanNew<v8::FunctionTemplate>(WriteI2cBlockDataAsync)->GetFunction());
  exports->Set(NanNew<v8::String>("writeI2cBlockDataSync"),
    NanNew<v8::FunctionTemplate>(WriteI2cBlockDataSync)->GetFunction());
}

NODE_MODULE(i2c, InitAll)

