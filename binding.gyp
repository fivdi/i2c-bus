{
  "targets": [{
    "target_name": "i2c",
    "conditions": [[
      "OS == \"linux\"", {
        "cflags": [
          "-Wno-unused-local-typedefs"
        ]
      }]
    ],
    "include_dirs" : [
      "<!(node -e \"require('nan')\")"
    ],
    "sources": [
      "./src/i2c.cc",
      "./src/readbyte.cc",
      "./src/readbytedata.cc",
      "./src/readworddata.cc",
      "./src/readi2cblockdata.cc",
      "./src/setaddr.cc",
      "./src/writebyte.cc",
      "./src/writebytedata.cc",
      "./src/writeworddata.cc",
      "./src/writei2cblockdata.cc"
    ]
  }]
}

