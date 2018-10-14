{
  "targets": [{
    "target_name": "i2c",
    "include_dirs" : [
      "<!(node -e \"require('nan')\")"
    ],
    "conditions": [[
      '"<!(echo $V)" != "1"', {
        "cflags": [
          "-Wno-deprecated-declarations",
          "-Wno-cast-function-type"
        ]
      }]
    ],
    "sources": [
      "./src/i2c.cc"
    ]
  }]
}

