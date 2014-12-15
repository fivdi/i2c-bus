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
      "./src/readword.cc",
      "./src/readbytes.cc",
      "./src/receivebyte.cc",
      "./src/sendbyte.cc",
      "./src/setaddr.cc",
      "./src/writebyte.cc",
      "./src/writeword.cc",
      "./src/writebytes.cc"
    ]
  }]
}

