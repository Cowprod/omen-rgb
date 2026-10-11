# omen-rgb

Minimal Node.js controller for the HP Omen TracerLED USB HID lighting controller on Linux.

**Status: v0.1 development.** The HID protocol has been physically validated on an HP Omen 40L GT21 with USB ID `103c:84fd` passed through to an Ubuntu 24.04 VM. This Node.js implementation still requires physical validation.

## Supported hardware and zones

| Zone | Name | Hardware observed |
| --- | --- | --- |
| 1 | `logo` | Omen logo |
| 2 | `interior` | Interior case lighting |
| 3 | `fans` | Both front fan rings together |

Zones 4–7 exist in the OpenRGB 30L protocol but have **not** been validated on this 40L.

## Requirements

Linux, Node.js >= 18, and read/write permission to the appropriate `/dev/hidrawN` device. No npm runtime dependencies.

## Usage

```bash
node bin/omen-rgb.js detect
node bin/omen-rgb.js set logo FF0000
node bin/omen-rgb.js set interior 00FF00
node bin/omen-rgb.js set fans 0000FF
node bin/omen-rgb.js set all FFFFFF --brightness 50
npm test
```

If necessary for the first hardware test, run with `sudo node ...`. Prefer a udev rule for regular operation. The HID device number can change after reboot; detection uses the USB HID ID. You may explicitly pass `--device /dev/hidrawN`.

**Caution:** Commands may change or extinguish lighting until reboot. Avoid concurrent RGB controllers. Brightness 0 has not been validated as a power-off command.

## Protocol

The Linux `hidraw` device accepts 58-byte reports. Static RGB data starts at offset `8 + (zone - 1) * 3`, the zone number is at offset 54, and static type `0x02` is at offset 49.

## Credits

Protocol understanding benefited from [OpenRGB](https://gitlab.com/CalcProgrammer1/OpenRGB), particularly its `HPOmen30LController`, and [leogeal/omen-led](https://github.com/leogeal/omen-led). This project independently implements the observed HID message format in Node.js; no source files from either project are incorporated.

MIT license; see LICENSE.
