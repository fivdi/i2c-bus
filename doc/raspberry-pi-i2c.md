## Configuring I2C on the Raspberry Pi

This guide assumes that release 2015-01-31 or later of the Raspbian Operating
System is being used.

An I2C bus is broken out to pins 3 (SDA) and 5 (SCL) on the P1 header. To
use this I2C bus, the following steps need to be performed:

#### Step 1 - Enable I2C

To enable I2C add the following line to `/boot/config.txt`:

```
dtparam=i2c_arm=on
```

The raspi-config tool can also be used to enable I2C under "Advanced Options".

#### Step 2 - Enable user space access to I2C

To enable userspace access to I2C add the following line to `/etc/modules`:

```
i2c-dev
```

#### Step 3 - Setting the I2C baudrate

The default I2C baudrate is 100000. If required, this can be changed with the
`i2c_arm_baudrate` parameter. For example, to set the baudrate to 400000, add
the following line to `/boot/config.txt`:

```
dtparam=i2c_arm_baudrate=400000
```

#### Step 4 - I2C access without root privileges

If release 2015-05-05 or later of the Raspbian Operating System is being used,
this step can be skipped as user `pi` can access the I2C bus without root
privileges.

If an earlier release of the Raspbian Operating System is being used, create a
file called `99-i2c.rules` in directory `/etc/udev/rules.d` with the following
content:

```
SUBSYSTEM=="i2c-dev", MODE="0666"
```

This will give all users access to I2C and sudo need not be specified when
executing programs using i2c-bus. A more selective rule should be used if
required.

#### Step 5 - Reboot the Raspberry Pi

After performing the above steps, reboot the Raspberry Pi.

