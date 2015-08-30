#include <node.h>
#include <nan.h>
#include "./i2cfuncs.h"
#include "./readbyte.h"
#include "./readword.h"
#include "./readblock.h"
#include "./readi2cblock.h"
#include "./receivebyte.h"
#include "./sendbyte.h"
#include "./setaddr.h"
#include "./writebyte.h"
#include "./writeword.h"
#include "./writeblock.h"
#include "./writei2cblock.h"
#include "./writequick.h"
#include "./i2c-dev.h"

NAN_MODULE_INIT(InitAll) {
  Nan::Set(target, Nan::New<v8::String>("i2cFuncsAsync").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(I2cFuncsAsync)).ToLocalChecked());
  Nan::Set(target, Nan::New<v8::String>("i2cFuncsSync").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(I2cFuncsSync)).ToLocalChecked());

  Nan::Set(target, Nan::New<v8::String>("readByteAsync").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(ReadByteAsync)).ToLocalChecked());
  Nan::Set(target, Nan::New<v8::String>("readByteSync").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(ReadByteSync)).ToLocalChecked());

  Nan::Set(target, Nan::New<v8::String>("readWordAsync").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(ReadWordAsync)).ToLocalChecked());
  Nan::Set(target, Nan::New<v8::String>("readWordSync").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(ReadWordSync)).ToLocalChecked());

  Nan::Set(target, Nan::New<v8::String>("readBlockAsync").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(ReadBlockAsync)).ToLocalChecked());
  Nan::Set(target, Nan::New<v8::String>("readBlockSync").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(ReadBlockSync)).ToLocalChecked());

  Nan::Set(target, Nan::New<v8::String>("readI2cBlockAsync").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(ReadI2cBlockAsync)).ToLocalChecked());
  Nan::Set(target, Nan::New<v8::String>("readI2cBlockSync").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(ReadI2cBlockSync)).ToLocalChecked());

  Nan::Set(target, Nan::New<v8::String>("receiveByteAsync").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(ReceiveByteAsync)).ToLocalChecked());
  Nan::Set(target, Nan::New<v8::String>("receiveByteSync").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(ReceiveByteSync)).ToLocalChecked());

  Nan::Set(target, Nan::New<v8::String>("sendByteAsync").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(SendByteAsync)).ToLocalChecked());
  Nan::Set(target, Nan::New<v8::String>("sendByteSync").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(SendByteSync)).ToLocalChecked());

  Nan::Set(target, Nan::New<v8::String>("setAddrAsync").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(SetAddrAsync)).ToLocalChecked());
  Nan::Set(target, Nan::New<v8::String>("setAddrSync").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(SetAddrSync)).ToLocalChecked());

  Nan::Set(target, Nan::New<v8::String>("writeByteAsync").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(WriteByteAsync)).ToLocalChecked());
  Nan::Set(target, Nan::New<v8::String>("writeByteSync").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(WriteByteSync)).ToLocalChecked());

  Nan::Set(target, Nan::New<v8::String>("writeWordAsync").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(WriteWordAsync)).ToLocalChecked());
  Nan::Set(target, Nan::New<v8::String>("writeWordSync").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(WriteWordSync)).ToLocalChecked());

  Nan::Set(target, Nan::New<v8::String>("writeBlockAsync").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(WriteBlockAsync)).ToLocalChecked());
  Nan::Set(target, Nan::New<v8::String>("writeBlockSync").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(WriteBlockSync)).ToLocalChecked());

  Nan::Set(target, Nan::New<v8::String>("writeI2cBlockAsync").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(WriteI2cBlockAsync)).ToLocalChecked());
  Nan::Set(target, Nan::New<v8::String>("writeI2cBlockSync").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(WriteI2cBlockSync)).ToLocalChecked());

  Nan::Set(target, Nan::New<v8::String>("writeQuickAsync").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(WriteQuickAsync)).ToLocalChecked());
  Nan::Set(target, Nan::New<v8::String>("writeQuickSync").ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(WriteQuickSync)).ToLocalChecked());

  Nan::Set(target, Nan::New<v8::String>("I2C_FUNC_I2C").ToLocalChecked(),
    Nan::New<v8::Integer>(I2C_FUNC_I2C));
  Nan::Set(target, Nan::New<v8::String>("I2C_FUNC_10BIT_ADDR").ToLocalChecked(),
    Nan::New<v8::Integer>(I2C_FUNC_10BIT_ADDR));
  Nan::Set(target, Nan::New<v8::String>("I2C_FUNC_PROTOCOL_MANGLING").ToLocalChecked(),
    Nan::New<v8::Integer>(I2C_FUNC_PROTOCOL_MANGLING));
  Nan::Set(target, Nan::New<v8::String>("I2C_FUNC_SMBUS_PEC").ToLocalChecked(),
    Nan::New<v8::Integer>(I2C_FUNC_SMBUS_PEC));
  Nan::Set(target, Nan::New<v8::String>("I2C_FUNC_SMBUS_BLOCK_PROC_CALL").ToLocalChecked(),
    Nan::New<v8::Integer>(I2C_FUNC_SMBUS_BLOCK_PROC_CALL));
  Nan::Set(target, Nan::New<v8::String>("I2C_FUNC_SMBUS_QUICK").ToLocalChecked(),
    Nan::New<v8::Integer>(I2C_FUNC_SMBUS_QUICK));
  Nan::Set(target, Nan::New<v8::String>("I2C_FUNC_SMBUS_READ_BYTE").ToLocalChecked(),
    Nan::New<v8::Integer>(I2C_FUNC_SMBUS_READ_BYTE));
  Nan::Set(target, Nan::New<v8::String>("I2C_FUNC_SMBUS_WRITE_BYTE").ToLocalChecked(),
    Nan::New<v8::Integer>(I2C_FUNC_SMBUS_WRITE_BYTE));
  Nan::Set(target, Nan::New<v8::String>("I2C_FUNC_SMBUS_READ_BYTE_DATA").ToLocalChecked(),
    Nan::New<v8::Integer>(I2C_FUNC_SMBUS_READ_BYTE_DATA));
  Nan::Set(target, Nan::New<v8::String>("I2C_FUNC_SMBUS_WRITE_BYTE_DATA").ToLocalChecked(),
    Nan::New<v8::Integer>(I2C_FUNC_SMBUS_WRITE_BYTE_DATA));
  Nan::Set(target, Nan::New<v8::String>("I2C_FUNC_SMBUS_READ_WORD_DATA").ToLocalChecked(),
    Nan::New<v8::Integer>(I2C_FUNC_SMBUS_READ_WORD_DATA));
  Nan::Set(target, Nan::New<v8::String>("I2C_FUNC_SMBUS_WRITE_WORD_DATA").ToLocalChecked(),
    Nan::New<v8::Integer>(I2C_FUNC_SMBUS_WRITE_WORD_DATA));
  Nan::Set(target, Nan::New<v8::String>("I2C_FUNC_SMBUS_PROC_CALL").ToLocalChecked(),
    Nan::New<v8::Integer>(I2C_FUNC_SMBUS_PROC_CALL));
  Nan::Set(target, Nan::New<v8::String>("I2C_FUNC_SMBUS_READ_BLOCK_DATA").ToLocalChecked(),
    Nan::New<v8::Integer>(I2C_FUNC_SMBUS_READ_BLOCK_DATA));
  Nan::Set(target, Nan::New<v8::String>("I2C_FUNC_SMBUS_WRITE_BLOCK_DATA").ToLocalChecked(),
    Nan::New<v8::Integer>(I2C_FUNC_SMBUS_WRITE_BLOCK_DATA));
  Nan::Set(target, Nan::New<v8::String>("I2C_FUNC_SMBUS_READ_I2C_BLOCK").ToLocalChecked(),
    Nan::New<v8::Integer>(I2C_FUNC_SMBUS_READ_I2C_BLOCK));
  Nan::Set(target, Nan::New<v8::String>("I2C_FUNC_SMBUS_WRITE_I2C_BLOCK").ToLocalChecked(),
    Nan::New<v8::Integer>(I2C_FUNC_SMBUS_WRITE_I2C_BLOCK));
}

NODE_MODULE(i2c, InitAll)

// Hack to speed up compilation.
// Originally all the cc files included below were listed in the sources
// section of binding.gyp. Including them here rather than compiling them
// individually, which is what happens if they're listed in binding.gyp,
// reduces the build time from 36s to 15s on a BBB.
#include "./i2cfuncs.cc"
#include "./readbyte.cc"
#include "./readword.cc"
#include "./readblock.cc"
#include "./readi2cblock.cc"
#include "./receivebyte.cc"
#include "./sendbyte.cc"
#include "./setaddr.cc"
#include "./writebyte.cc"
#include "./writeword.cc"
#include "./writeblock.cc"
#include "./writei2cblock.cc"
#include "./writequick.cc"

