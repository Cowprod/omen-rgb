# Hardware validation record

- Machine: HP Omen 40L GT21 (PC005).
- Host: Proxmox VE; HP TracerLED USB device passed through to Ubuntu 24.04.5 LTS VM.
- USB vendor `103c`, product `84fd`.
- HID: 58-byte input/output reports.
- Proven physical mappings: zone 1 = logo; zone 2 = interior; zone 3 = both front fan rings.
- Three zones independently displayed red, green and blue simultaneously using the Python proof of concept.
- The original `omen-led` script writes static RGB at a fixed offset and can extinguish other zones.
- Reboot restored white lighting after earlier experiments.
- Node.js implementation still awaits physical validation.

No firmware flashing is involved.
