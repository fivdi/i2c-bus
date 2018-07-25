{
  "targets": [{
    "target_name": "i2c",
    "include_dirs" : [
      "<!(node -e \"require('nan')\")"
    ],
    "conditions": [[
      "OS == \"linux\"", {
        "cflags": [
          "-Wno-unused-local-typedefs"
        ],
        "sources": [
         "./src/i2c.cc"
        ]
      }]
    ]
  }]
}

